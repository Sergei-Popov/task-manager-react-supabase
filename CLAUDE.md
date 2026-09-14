# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

Менеджер задач «Мои задачи»: одностраничное React-приложение плюс собственный
Node API и PostgreSQL. Задачи с дедлайнами, подзадачами, тегами, категориями и
повторением; три представления: список, канбан, календарь. Интерфейс, комментарии
в коде и сообщения API на русском языке.

Проект начинался на Supabase (об этом напоминает имя репозитория). Supabase
полностью удалён: авторизация, БД и API теперь свои. Не возвращать Supabase и не
предлагать BaaS.

## Рабочий процесс (обязательно)

Полные правила: `docs/AI-RULES.md`. Кратко:

1. **Сначала понять, потом делать.** Любая фича или баг начинается с интервью
   через навык `grilling` (команды `/feature`, `/bugfix`, `/grill-me`,
   `/grill-with-docs`). Вопросы раундами с рекомендуемым ответом; факты о коде
   агент выясняет сам. Реализация только после подтверждения пользователя.
   Фичи фиксируются в `docs/specs/`.
2. **Термины из `CONTEXT.md`**, решения из `docs/adr/` не нарушать. Новые термины
   и важные решения записывать туда же (навык `domain-modeling`).
3. **Каждое изменение проверяется в браузере**: `/verify` по `docs/TESTING.md`
   (lint, build, сценарий, скриншоты на 1280 и 390 px, которые нужно открыть и
   посмотреть, консоль без ошибок). Найденное исправить и проверить заново.
   Отчёт без реальной проверки запрещён.
4. **Баги** диагностируются по навыку `diagnosing-bugs`: сначала повторяемый
   сигнал, потом гипотезы, потом фикс.
5. **Выкладка** через `/ship`: lint, build, `docker compose up -d --build`,
   проверка на :8080, коммит; пуш только по явной просьбе.

Документация: `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEVELOPMENT.md`,
`docs/TESTING.md`, `docs/DEPLOYMENT.md`. Обновлять при изменении API,
архитектуры и процессов.

## Стек

| Слой     | Технологии                                                              |
| -------- | ----------------------------------------------------------------------- |
| Frontend | React 19, Vite 7, Tailwind CSS 4, shadcn/ui (preset radix-nova, Lucide, next-themes), react-router-dom 7, @dnd-kit (канбан) |
| API      | Node 22, Express 5, `pg` (без ORM), fastest-validator, express-rate-limit |
| Auth     | Своя: email + пароль, scrypt из `node:crypto`, сессии в httpOnly-cookie |
| БД       | PostgreSQL 17, SQL-миграции, применяются при старте API                 |
| Деплой   | Docker Compose: `db` + `api` + `web` (Caddy отдаёт SPA и проксирует /api) |
| Качество | ESLint 9 (flat config), Prettier; автотестов нет, проверка по `docs/TESTING.md` |
| Навыки   | `.agents/skills/` (grilling, grill-me, grill-with-docs, domain-modeling, diagnosing-bugs), `.claude/skills/` (feature, bugfix, verify, ship) |

## Команды

```bash
npm install                 # ставит зависимости корня и server/ (postinstall)
cp .env.example .env        # POSTGRES_PASSWORD обязателен
docker compose up -d db     # только Postgres на 127.0.0.1:5432
npm run dev:all             # API на :3001 и Vite на :5173 вместе
npm run dev                 # только Vite (проксирует /api → 127.0.0.1:3001)
npm run dev:api             # только API, node --watch, читает ../.env
npm run lint                # eslint для src/ и server/
npm run build               # фронтенд в dist/
npm --prefix server run migrate   # применить миграции вручную

docker compose up -d --build      # полный production-стек (порты из .env)
docker compose logs -f api
psql "$DATABASE_URL"              # DATABASE_URL берётся из .env
```

Локально API слушает 3001, потому что 3000 на этой машине занят. Внутри
Docker API работает на 3000, Caddy проксирует на `api:3000`.

На этой машине Docker Desktop не стартует, используется Colima. Перед docker
командами: `export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock`
(или `docker context use colima`).

## Структура

```
src/
  index.css                    Tailwind + тема shadcn (стандартная neutral, .dark через next-themes)
  main.jsx                     маршруты, ThemeProvider, TooltipProvider, Toaster (sonner)
  components/ui/               компоненты shadcn/ui (сгенерированы `npx shadcn add`, JS, alias @/)
  components/ConfirmDialog.jsx AlertDialog вместо window.confirm (state в DashboardPage)
  components/ThemeToggle.jsx   переключатель светлая/тёмная/системная
  lib/icons.jsx                иконки статусов и приоритетов (Lucide) вместо эмодзи
  pages/Wrapper.jsx            защита /dashboard: GET /api/auth/me, иначе → /login
  pages/DashboardPage/         весь стейт и вызовы API дашборда (один большой компонент)
  components/Dashboard/        презентационные компоненты дашборда + constants.js
  components/Dashboard/TaskForm.jsx  общая форма задачи для создания и редактирования
  components/Dashboard/QuickAdd.jsx  быстрое добавление (текст + Enter, срок сегодня 18:00)
  components/Dashboard/FilterBar.jsx сортировка, фильтр приоритета, «скрыть завершённые»
  components/Dashboard/grouping.js   группы списка (Просрочено/Сегодня/Завтра/…), сортеры, defaultDeadline
  components/DateTimePicker/   свой пикер даты и времени
  utils/api.js                 единственная точка обращения к API (fetch + cookie)
  utils/validator.js           схема формы регистрации (fastest-validator)
server/
  src/index.js                 ждёт БД, применяет миграции, поднимает Express
  src/app.js                   сборка приложения: middleware, роуты, обработчик ошибок
  src/auth.js                  хеши паролей, сессии, attachUser/requireAuth, /api/auth/*
  src/routes/{tasks,categories,tags}.js
  src/validate.js              validateBody(schema) и uuidParam()
  src/migrate.js               раннер *.sql из server/migrations по алфавиту
  migrations/0001_init.sql     users, sessions, categories, tags, tasks, subtasks, task_tags
docker-compose.yml, Dockerfile (web), server/Dockerfile, Caddyfile
```

## Как всё связано

**Авторизация.** `POST /api/auth/register|login` создают запись в `sessions`
(хранится sha256 токена) и ставят cookie `tm_session` (httpOnly, SameSite=Lax,
`secure` по `req.secure`, 30 дней). Middleware `attachUser` кладёт `req.user`
или `null`; `requireAuth` закрывает `/api/tasks`, `/api/categories`, `/api/tags`.
`GET /api/auth/me` отдаёт `{user: null}` со статусом 200, а не 401, на это
рассчитан `Wrapper`. Подтверждения email нет и не нужно.

**Изоляция данных.** RLS нет, вместо неё каждый SQL-запрос в роутах фильтрует
по `user_id = req.user.id`. При добавлении запросов сохранять это правило.
`task_tags` вставляет только теги, принадлежащие пользователю.

**Форма ответа задач.** `GET /api/tasks` и все мутации возвращают задачу с
вложенными `subtasks: [{id,text,is_completed,position}]` и
`task_tags: [{tag_id}]` (агрегируются в SQL через `json_agg`). Фронтенд
опирается именно на эти имена, они унаследованы от прежней схемы Supabase.
`PATCH /api/tasks/:id` принимает частичное тело; если переданы `subtasks` или
`tags`, они заменяются целиком (delete + insert в транзакции).

**Категории.** Поле `tasks.category` это текст: либо id встроенной категории
(`work`, `personal`, … из `constants.js`), либо uuid пользовательской из таблицы
`categories`. Внешнего ключа нет намеренно, `getCategoryInfo` в DashboardPage
резолвит в обе стороны.

**Даты.** `deadline` приходит строкой ISO с таймзоной из DateTimePicker,
хранится как `timestamptz`. `recurrence_end_date` это `date` (`YYYY-MM-DD`);
пустая строка из `<input type="date">` нормализуется в `null` на сервере.

**Защита от CSRF.** Изменяющие запросы принимаются только с
`Content-Type: application/json` (см. `app.js`), поэтому клиентский `api.js`
всегда шлёт JSON и `credentials: "include"`.

**Валидация.** На сервере схемы fastest-validator через `validateBody`;
`$$strict: "remove"` отбрасывает лишние поля. На фронтенде валидируется только
форма регистрации (`utils/validator.js`), остальное полагается на сервер.

**Миграции.** Новый файл `server/migrations/0002_<name>.sql`; раннер
применяет по алфавиту и записывает в `schema_migrations`, под advisory lock.
Миграции применяются при каждом старте API, в том числе в Docker.

## UI

- Только shadcn/ui и Tailwind-утилиты, CSS-модулей больше нет. Классическая
  тема shadcn без своей палитры; цвета брать из токенов (`bg-primary`,
  `text-muted-foreground`), не хардкодить. Тёмная тема по умолчанию.
- Строгий стиль по просьбе пользователя: никаких цветных полосок на карточках,
  градиентов и свечений. Цвет задачи показывается только маленькой точкой
  (`size-2 rounded-full`), цвета тегов только в Badge.
- Фичи дашборда: быстрое добавление, список сгруппирован по срокам, сортировка
  и фильтры, кружок «выполнено» на карточке (`DoneToggle`), прогресс подзадач,
  отметка подзадач прямо в просмотре (`toggleSubtask` шлёт полный список),
  «+» в колонке канбана (`openCreateWithStatus`) и в дне календаря
  (`openCreateAt`), горячие клавиши `N` (новая задача) и `/` (поиск).
- Иконки только Lucide. Эмодзи остаются лишь у категорий: это данные
  пользователя (иконку выбирают в `CategoryModal`).
- Импорт компонентов через alias `@/` (`jsconfig.json` + `vite.config.js`).
  `components.json` настроен на JS (`tsx: false`), новые компоненты добавлять
  `npx shadcn@latest add <name>`.
- Layout дашборда: `SidebarProvider` → `Sidebar` (свой, на примитивах shadcn) +
  `SidebarInset`. На мобильных сайдбар сам превращается в Sheet, открывается
  `SidebarTrigger`.
- Подтверждения удаления через `ConfirmDialog` (`setConfirm({...})` в
  DashboardPage), уведомления через `toast` из sonner.
- В ESLint включены `react/jsx-uses-vars` и `react/jsx-no-undef`: без них
  неизвестный компонент в JSX (например, забытый импорт иконки) не ловится.

## Соглашения

- ESLint: для `src/` браузерные глобалы и правила React hooks; для `server/**`
  и `vite.config.js` глобалы Node; для `src/components/ui/**` и `src/lib/**`
  выключено `react-refresh/only-export-components`. Не вызывать `setState`
  внутри `useEffect` (правило `react-hooks/set-state-in-effect` включено).
- Prettier форматирует `.js/.jsx`; файлы `src/components/ui/*.jsx` после
  генерации можно прогонять через Prettier.
- Сообщения об ошибках API отдаются в поле `error` на русском, фронтенд
  показывает их как есть (`ApiError.message`).
- `server/` имеет отдельный `package.json`; зависимости бэкенда добавлять туда,
  не в корень.
- Секреты только в `.env` (в gitignore); `.env.example` держать актуальным.
