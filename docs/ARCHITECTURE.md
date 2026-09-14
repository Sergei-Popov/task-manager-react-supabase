# Архитектура

Три части, один репозиторий:

```
Браузер (React SPA) ──/api/*──▶ Express API ──SQL──▶ PostgreSQL
        │                            │
        └── статика через Caddy ◀────┘ (в Docker; в dev — Vite с прокси)
```

## Фронтенд (`src/`)

- **Роутинг** в `src/main.jsx`: `/` лендинг, `/login`, `/registration`,
  `/dashboard` (защищён `pages/Wrapper.jsx`, который спрашивает `GET /api/auth/me`).
- **Весь стейт дашборда в одном месте**: `pages/DashboardPage/DashboardPage.jsx`
  хранит задачи, категории, теги, фильтры, открытые модалки и содержит все вызовы
  API. Компоненты в `components/Dashboard/` презентационные и получают данные и
  колбэки через props.
- **Единая точка запросов**: `utils/api.js`. Никаких `fetch` в компонентах.
- **UI**: Tailwind CSS 4 + shadcn/ui (`components/ui/`, сгенерировано CLI, JS).
  Тема в `index.css`, стандартная neutral, тёмная по умолчанию через next-themes.
- **Иконки**: Lucide через `lib/icons.jsx` для статусов и приоритетов.
- **Ключевые компоненты дашборда**:
  - `Sidebar.jsx` — фильтры по статусу и категориям, управление категориями и тегами.
  - `QuickAdd.jsx`, `FilterBar.jsx`, `grouping.js` — быстрое добавление, сортировка,
    фильтры и группировка списка по срокам.
  - `TaskCard.jsx` — карточка списка (кружок «выполнено», Select статуса, прогресс).
  - `TaskForm.jsx` — форма задачи, общая для `TaskModal` (создание) и
    `TaskViewModal` (редактирование).
  - `KanbanBoard/Column/Card.jsx` — канбан на @dnd-kit (мышь, тач, клавиатура).
  - `CalendarView.jsx` — месячная сетка на планшете/десктопе, список дней на мобильном.
  - `DateTimePicker/` — Popover + Calendar (react-day-picker, ru) + Select времени;
    отдаёт строку ISO с локальным часовым поясом.
  - `components/ConfirmDialog.jsx` — AlertDialog вместо `window.confirm`.

## Бэкенд (`server/`)

- `src/index.js` ждёт БД, применяет миграции (`src/migrate.js`, файлы
  `migrations/*.sql` по алфавиту, учёт в `schema_migrations`), поднимает Express.
- `src/app.js` собирает приложение: `express.json`, guard «только JSON для
  изменяющих запросов», `attachUser`, роуты, обработчик ошибок.
- `src/auth.js`: scrypt-хеши паролей, сессии (sha256 токена в БД), cookie
  `tm_session`, middleware `attachUser`/`requireAuth`, роуты `/api/auth/*`,
  rate limit на вход и регистрацию.
- `src/routes/tasks.js`, `categories.js`, `tags.js`: CRUD с фильтром по
  `req.user.id` в каждом запросе. Задачи отдаются с вложенными `subtasks` и
  `task_tags` через `json_agg`.
- `src/validate.js`: `validateBody(schema)` на fastest-validator (`$$strict: "remove"`)
  и `uuidParam()`.

## Данные

Таблицы: `users`, `sessions`, `categories`, `tags`, `tasks`, `subtasks`, `task_tags`.
Схема в `server/migrations/0001_init.sql`. Особенности:

- `tasks.category` — текст: id встроенной категории или uuid пользовательской
  (см. ADR-0003).
- `tasks.deadline` — `timestamptz`; `recurrence_end_date` — `date`.
- `subtasks.position` задаёт порядок; при обновлении задачи подзадачи и связи с
  тегами заменяются целиком.

## Потоки

**Вход**: форма → `POST /api/auth/login` → cookie → `navigate("/dashboard")` →
`Wrapper` проверяет `/api/auth/me` → дашборд грузит `/api/tasks`, `/api/categories`,
`/api/tags` параллельно.

**Создание задачи**: `TaskForm` меняет `newTask` в DashboardPage → `handleSubmit`
собирает `buildTaskPayload()` → `POST /api/tasks` → ответ (задача с подзадачами и
тегами) добавляется в стейт → toast.

**Смена статуса**: Select на карточке, кружок «выполнено» или drag в канбане →
`updateTaskStatus` → `PATCH /api/tasks/:id {status}` → стейт заменяется ответом.

## Деплой

`docker-compose.yml`: `db` (postgres:17), `api` (образ из `server/Dockerfile`),
`web` (multi-stage: сборка Vite → Caddy). Caddy отдаёт `dist/` с SPA-fallback и
проксирует `/api/*` на `api:3000`. Подробнее в `docs/DEPLOYMENT.md`.
