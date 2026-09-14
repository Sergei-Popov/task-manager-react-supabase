# Разработка

## Требования

Node 22+, Docker-совместимый движок (Colima на этой машине: Docker Desktop не
стартует), `psql` по желанию.

```bash
brew install colima && colima start --cpu 4 --memory 8 --vm-type vz --mount-type virtiofs
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock   # перед docker-командами
```

## Запуск

```bash
npm install                 # + зависимости server/ через postinstall
cp .env.example .env        # задать POSTGRES_PASSWORD
docker compose up -d db     # Postgres на 127.0.0.1:5432
npm run dev:all             # API :3001 и Vite :5173
```

Адреса: приложение http://localhost:5173, API http://127.0.0.1:3001/api,
production-сборка в Docker http://localhost:8080 (порт из `.env`, `HTTP_PORT`).

## Скрипты

| Команда | Что делает |
| --- | --- |
| `npm run dev` | только Vite (прокси `/api` → 127.0.0.1:3001) |
| `npm run dev:api` | только API, `node --watch`, читает `../.env` |
| `npm run dev:all` | оба процесса в одном терминале |
| `npm run lint` | ESLint для `src/` и `server/` |
| `npm run build` | сборка фронтенда в `dist/` |
| `npm --prefix server run migrate` | миграции вручную |
| `npx shadcn@latest add <name>` | добавить компонент shadcn (JS, alias `@/`) |
| `docker compose up -d --build` | полный стек в Docker |

## Тестовые данные

В локальной базе есть пользователь `sergei@example.com` / `Secret1!` (и другие
тестовые). Новый пользователь регистрируется мгновенно, письма не нужны.

## Как добавить

**Поле задачи**: миграция `server/migrations/000N_*.sql` → схема в
`server/src/routes/tasks.js` (`taskFields`, `TASK_COLUMNS`) → `INITIAL_TASK_STATE`
в `components/Dashboard/constants.js` → `TaskForm.jsx` → `buildTaskPayload` в
DashboardPage → отображение в `TaskCard`/`KanbanCard`/`TaskViewModal` → `docs/API.md`.

**Эндпоинт**: роут в `server/src/routes/` с `validateBody` и фильтром по
`req.user.id` → метод в `src/utils/api.js` → обработчик в DashboardPage с toast
на ошибку → `docs/API.md`.

**Компонент shadcn**: `npx shadcn@latest add <name>`, затем заменить в нём
`from "cn"` на `from "@/lib/utils"` не обязательно (пакет `cn` установлен), но
единообразие приветствуется.

## Соглашения кода

- Комментарии, тексты интерфейса и сообщения API на русском.
- В компонентах нет `fetch`: только `api.*` из `utils/api.js`.
- Ошибки пользователю через `toast.error(error.message)`, подтверждения через
  `ConfirmDialog`, никакого `window.confirm`/`alert`.
- Цвета только через токены темы; строгий стиль без полосок и градиентов (ADR-0004).
- ESLint должен быть чистым, Prettier применяется к `.js/.jsx`.
