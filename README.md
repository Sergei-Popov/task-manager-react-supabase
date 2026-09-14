# Менеджер задач "Мои задачи"

React + Vite + Supabase (Postgres, Auth, RLS). Задачи с дедлайнами, подзадачами,
тегами, категориями, повторением; список, канбан и календарь.

## Стек

- Frontend: React 19, Vite 7, react-router 7, @dnd-kit
- Backend: Supabase (PostgreSQL + Auth + PostgREST), схема лежит в `supabase/migrations`
- Хостинг: Vercel (frontend) + Supabase Cloud (БД и auth)

## Локальный запуск (полностью локальный Supabase)

Нужны Node 20+, Docker-совместимый движок и Supabase CLI
(`brew install supabase/tap/supabase`).

Подойдёт Docker Desktop, OrbStack или Colima. Если Docker Desktop не стартует
(на этой машине он не поднимал сетевой мост VM), используйте Colima:

```bash
brew install colima
colima start --cpu 4 --memory 8 --vm-type vz --mount-type virtiofs
docker context use colima
# Supabase CLI смотрит на DOCKER_HOST, поэтому перед db:* командами:
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
```

```bash
npm install
npm run db:start          # поднимает Postgres, Auth, PostgREST, Studio в Docker
                          # и применяет миграции из supabase/migrations
cp .env.example .env.local
# подставьте в .env.local значения API URL и anon key, которые напечатал db:start
npm run dev               # http://localhost:5173
```

Полезные адреса локального стека:

| Что            | Адрес                      |
| -------------- | -------------------------- |
| API (Supabase) | http://127.0.0.1:54321     |
| Studio         | http://127.0.0.1:54323     |
| Почта (Mailpit)| http://127.0.0.1:54324     |
| Postgres       | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

Другие команды:

```bash
npm run db:status   # показать URL и ключи
npm run db:reset    # пересоздать БД и заново применить миграции
npm run db:stop     # остановить контейнеры
```

Сразу после входа PostgREST иногда отвечает `PGRST303 "JWT issued at future"`
(токен выдан в ту же секунду, что и запрос). Приложение повторяет такой запрос
через секунду, так что в консоли может мелькнуть один 401 — это ожидаемо.

Локально подтверждение email выключено (`supabase/config.toml`,
`[auth.email] enable_confirmations = false`), поэтому регистрация сразу
пускает в приложение. Если включить подтверждение, письма ловит Mailpit.

## Схема БД

`supabase/migrations/20260914000000_init_schema.sql`:

- `categories` — пользовательские категории (name, icon)
- `tags` — теги (name, color)
- `tasks` — задачи (text, deadline, category, color, status, priority, повторение)
- `subtasks` — подзадачи задачи (text, is_completed, position)
- `task_tags` — связь задач и тегов

На всех таблицах включён RLS: пользователь видит и меняет только свои строки.
Новые изменения схемы добавляйте новой миграцией:
`supabase migration new <name>`, затем `npm run db:reset` локально
и `npm run db:push` в облако.

## Публикация (Vercel + Supabase Cloud)

1. Создайте проект на https://supabase.com/dashboard (регион любой, пароль БД сохраните).
2. Привяжите локальный репозиторий к проекту и накатите миграции:

   ```bash
   supabase login
   supabase link --project-ref <project-ref>   # ref из URL панели
   npm run db:push
   ```

3. В панели Supabase: Authentication → URL Configuration:
   - Site URL: `https://<ваш-домен>.vercel.app`
   - Redirect URLs: тот же адрес.

   Authentication → Providers → Email: если хотите регистрацию без письма,
   выключите "Confirm email". Если оставить включённым, приложение после
   регистрации покажет "проверьте почту", а вход станет доступен после
   перехода по ссылке из письма.

4. На Vercel задайте переменные окружения (Settings → Environment Variables):
   - `VITE_SUPABASE_URL` — Project URL из Settings → API
   - `VITE_SUPABASE_KEY` — anon (public) key оттуда же

   Или через CLI:

   ```bash
   vercel login
   vercel link
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_KEY production
   vercel --prod
   ```

`vercel.json` уже содержит rewrite всех путей на `index.html` для react-router.
