# Менеджер задач "Мои задачи"

React + Vite на фронтенде, свой Node API и PostgreSQL на бэкенде, всё упаковано
в Docker Compose и разворачивается на любом VPS одной командой. Задачи с
дедлайнами, подзадачами, тегами, категориями и повторением; список, канбан и
календарь.

## Стек

| Слой      | Технологии                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React 19, Vite 7, react-router 7, @dnd-kit               |
| API       | Node 22, Express 5, `pg`, fastest-validator (`server/`)  |
| Auth      | Своя: email + пароль (scrypt), сессии в httpOnly-cookie  |
| БД        | PostgreSQL 17, SQL-миграции в `server/migrations`        |
| Хостинг   | Docker Compose: Postgres + API + Caddy (статика, HTTPS)  |

## Структура

```
src/                 фронтенд (React + Tailwind + shadcn/ui)
src/components/ui/   компоненты shadcn/ui (генерируются CLI, можно править)
src/utils/api.js     клиент нашего API (fetch + cookie)
server/src/          Express-приложение
server/migrations/   SQL-миграции, применяются при старте API
docker-compose.yml   db + api + web
Dockerfile           сборка фронтенда и образ Caddy
Caddyfile            статика + прокси /api → api:3000
```

## Документация и правила для ИИ

- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`,
  `docs/DEPLOYMENT.md` — устройство, эндпоинты, разработка, проверка, деплой.
- `CONTEXT.md` — глоссарий терминов, `docs/adr/` — принятые решения.
- `CLAUDE.md`, `AGENTS.md`, `docs/AI-RULES.md` — правила для ИИ-агентов.
- Команды Claude Code: `/feature <описание>`, `/bugfix <описание>`, `/verify`,
  `/ship`, а также `/grill-me`, `/grill-with-docs` для интервью по задаче.

## Локальная разработка

Нужны Node 22+ и Docker-совместимый движок (Docker Desktop, OrbStack или
Colima). Если Docker Desktop не стартует, используйте Colima:

```bash
brew install colima
colima start --cpu 4 --memory 8 --vm-type vz --mount-type virtiofs
docker context use colima
```

Запуск:

```bash
npm install                # ставит зависимости и фронтенда, и server/
cp .env.example .env       # задайте POSTGRES_PASSWORD
docker compose up -d db    # только Postgres, порт 127.0.0.1:5432
npm run dev:all            # API на :3001 и Vite на :5173 в одном терминале
```

Или в двух терминалах: `npm run dev:api` и `npm run dev`. Vite проксирует
`/api` на `http://127.0.0.1:3001`. API читает `.env` из корня и сам
применяет миграции при старте.

Полезное:

```bash
npm run lint                     # eslint для фронтенда и сервера
npx shadcn@latest add <name>     # добавить ещё компонент shadcn/ui
npm run build                    # сборка фронтенда в dist/
psql "$DATABASE_URL"             # консоль БД (DATABASE_URL из .env)
docker compose logs -f api       # логи API в Docker
```

## API

Все ответы в JSON. Сессия хранится в cookie `tm_session` (httpOnly,
SameSite=Lax, 30 дней). Изменяющие запросы принимаются только с
`Content-Type: application/json`.

| Метод  | Путь                    | Описание                                     |
| ------ | ----------------------- | -------------------------------------------- |
| POST   | `/api/auth/register`    | `{email, password}` → `{user}`, ставит cookie |
| POST   | `/api/auth/login`       | `{email, password}` → `{user}`               |
| POST   | `/api/auth/logout`      | удаляет сессию                               |
| GET    | `/api/auth/me`          | `{user}` или `{user: null}`                  |
| GET    | `/api/tasks`            | задачи с `subtasks` и `task_tags`            |
| POST   | `/api/tasks`            | создать задачу (с подзадачами и тегами)      |
| PATCH  | `/api/tasks/:id`        | обновить поля; `subtasks`/`tags` заменяются  |
| DELETE | `/api/tasks/:id`        | удалить                                      |
| GET/POST/PATCH/DELETE | `/api/categories[/:id]` | категории                     |
| GET/POST/PATCH/DELETE | `/api/tags[/:id]`       | теги                          |

Каждый пользователь видит и меняет только свои данные: все запросы
фильтруются по `user_id` из сессии.

## Схема БД

`server/migrations/0001_init.sql`: `users`, `sessions`, `categories`, `tags`,
`tasks`, `subtasks`, `task_tags`. Новые изменения добавляйте файлом
`server/migrations/0002_<name>.sql`; раннер применяет их по порядку и
запоминает применённые в `schema_migrations`.

## Публикация на VPS

Подойдёт любой сервер с Docker (Ubuntu 22.04+, 1 CPU / 1 ГБ RAM достаточно).

```bash
# на сервере
curl -fsSL https://get.docker.com | sh          # если Docker ещё нет
git clone https://github.com/Sergei-Popov/task-manager-react-supabase.git
cd task-manager-react-supabase
cp .env.example .env
nano .env   # POSTGRES_PASSWORD — длинная случайная строка
            # SITE_ADDRESS — домен (tasks.example.com) или :80 для работы по IP
docker compose up -d --build
```

Через минуту приложение доступно на `http://<ip-сервера>` или по домену.
С доменом Caddy сам получает и продлевает сертификат Let's Encrypt, нужно лишь
направить A-запись домена на сервер и открыть порты 80 и 443.

Обновление:

```bash
git pull
docker compose up -d --build
```

Бэкап базы:

```bash
docker compose exec db pg_dump -U tasks tasks > backup.sql
```

Регистрация работает сразу, без подтверждения почты: внешних сервисов
приложению не нужно.
