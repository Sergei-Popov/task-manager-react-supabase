-- Схема БД менеджера задач "Мои задачи".
-- Все таблицы принадлежат пользователю (auth.users) и защищены RLS:
-- каждый пользователь видит и меняет только свои строки.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories — пользовательские категории (помимо встроенных work/personal/...)
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  icon        text not null default '🎯',
  created_at  timestamptz not null default now()
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

create policy "categories: owner can select"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories: owner can insert"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories: owner can update"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories: owner can delete"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tags — пользовательские теги
-- ---------------------------------------------------------------------------
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now()
);

create index tags_user_id_idx on public.tags (user_id);

alter table public.tags enable row level security;

create policy "tags: owner can select"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "tags: owner can insert"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "tags: owner can update"
  on public.tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tags: owner can delete"
  on public.tags for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tasks — задачи
-- category хранит либо id встроенной категории ("work", "personal", ...),
-- либо uuid пользовательской категории в виде текста.
-- ---------------------------------------------------------------------------
create table public.tasks (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  text                 text not null check (char_length(text) between 1 and 2000),
  deadline             timestamptz not null,
  category             text not null default 'work',
  color                text not null default '#6366f1',
  status               text not null default 'todo'
                       check (status in ('todo', 'in_progress', 'done')),
  priority             text not null default 'medium'
                       check (priority in ('low', 'medium', 'high')),
  is_recurring         boolean not null default false,
  recurrence_type      text
                       check (recurrence_type is null
                              or recurrence_type in ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval  integer check (recurrence_interval is null or recurrence_interval >= 1),
  recurrence_end_date  date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_user_deadline_idx on public.tasks (user_id, deadline);

alter table public.tasks enable row level security;

create policy "tasks: owner can select"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks: owner can insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: owner can update"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks: owner can delete"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- updated_at обновляется автоматически
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- subtasks — подзадачи (принадлежат задаче; доступ проверяется через tasks)
-- ---------------------------------------------------------------------------
create table public.subtasks (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.tasks (id) on delete cascade,
  text          text not null check (char_length(text) between 1 and 500),
  is_completed  boolean not null default false,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index subtasks_task_id_idx on public.subtasks (task_id);

alter table public.subtasks enable row level security;

-- Вспомогательная функция: принадлежит ли задача текущему пользователю
create or replace function public.is_task_owner(p_task_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.tasks t
    where t.id = p_task_id and t.user_id = auth.uid()
  );
$$;

create policy "subtasks: task owner can select"
  on public.subtasks for select
  using (public.is_task_owner(task_id));

create policy "subtasks: task owner can insert"
  on public.subtasks for insert
  with check (public.is_task_owner(task_id));

create policy "subtasks: task owner can update"
  on public.subtasks for update
  using (public.is_task_owner(task_id))
  with check (public.is_task_owner(task_id));

create policy "subtasks: task owner can delete"
  on public.subtasks for delete
  using (public.is_task_owner(task_id));

-- ---------------------------------------------------------------------------
-- task_tags — связь задач и тегов (многие-ко-многим)
-- ---------------------------------------------------------------------------
create table public.task_tags (
  task_id  uuid not null references public.tasks (id) on delete cascade,
  tag_id   uuid not null references public.tags (id) on delete cascade,
  primary key (task_id, tag_id)
);

create index task_tags_tag_id_idx on public.task_tags (tag_id);

alter table public.task_tags enable row level security;

create policy "task_tags: task owner can select"
  on public.task_tags for select
  using (public.is_task_owner(task_id));

create policy "task_tags: task owner can insert"
  on public.task_tags for insert
  with check (
    public.is_task_owner(task_id)
    and exists (select 1 from public.tags g where g.id = tag_id and g.user_id = auth.uid())
  );

create policy "task_tags: task owner can delete"
  on public.task_tags for delete
  using (public.is_task_owner(task_id));
