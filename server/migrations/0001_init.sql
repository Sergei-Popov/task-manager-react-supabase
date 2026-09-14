-- Схема БД менеджера задач "Мои задачи".

create table users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  password_hash  text not null,
  created_at     timestamptz not null default now()
);

create table sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index sessions_user_id_idx on sessions (user_id);
create index sessions_expires_at_idx on sessions (expires_at);

create table categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  icon        text not null default '🎯',
  created_at  timestamptz not null default now()
);

create index categories_user_id_idx on categories (user_id);

create table tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now()
);

create index tags_user_id_idx on tags (user_id);

-- category хранит либо id встроенной категории ("work", "personal", ...),
-- либо uuid пользовательской категории в виде текста.
create table tasks (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users (id) on delete cascade,
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

create index tasks_user_deadline_idx on tasks (user_id, deadline);

create table subtasks (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references tasks (id) on delete cascade,
  text          text not null check (char_length(text) between 1 and 500),
  is_completed  boolean not null default false,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index subtasks_task_id_idx on subtasks (task_id);

create table task_tags (
  task_id  uuid not null references tasks (id) on delete cascade,
  tag_id   uuid not null references tags (id) on delete cascade,
  primary key (task_id, tag_id)
);

create index task_tags_tag_id_idx on task_tags (tag_id);
