# API

База: `/api`. Все ответы JSON. Ошибка всегда `{ "error": "<текст на русском>", "details"?: [...] }`.

## Правила

- Сессия в cookie `tm_session` (httpOnly, SameSite=Lax, 30 дней). Клиент шлёт
  `credentials: "include"`.
- Изменяющие запросы (POST/PATCH/DELETE) принимаются только с
  `Content-Type: application/json`, иначе `415`.
- Всё под `/api/tasks`, `/api/categories`, `/api/tags` требует сессию, иначе `401`.
- Пользователь видит только свои данные; чужой id даёт `404`.
- Лишние поля в теле отбрасываются, неверные дают `400` с `details` от валидатора.

## Auth

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{email, password}` (пароль 6–72) | `201 {user}` + cookie; `409` если email занят |
| POST | `/auth/login` | `{email, password}` | `200 {user}`; `401` «Неверный email или пароль» |
| POST | `/auth/logout` | — | `204`, cookie очищена |
| GET | `/auth/me` | — | `200 {user}` или `200 {user: null}` (не 401!) |

`user = { id, email, created_at }`.

## Tasks

Объект задачи:

```json
{
  "id": "uuid", "user_id": "uuid", "text": "…",
  "deadline": "2026-09-20T13:00:00.000Z",
  "category": "work | <uuid>", "color": "#6366f1",
  "status": "todo | in_progress | done", "priority": "low | medium | high",
  "is_recurring": false, "recurrence_type": null, "recurrence_interval": null,
  "recurrence_end_date": null, "created_at": "…", "updated_at": "…",
  "subtasks": [{ "id": "uuid", "text": "…", "is_completed": false, "position": 0 }],
  "task_tags": [{ "tag_id": "uuid" }]
}
```

| Метод | Путь | Тело | Заметки |
| --- | --- | --- | --- |
| GET | `/tasks` | — | массив, сортировка по `deadline` |
| POST | `/tasks` | поля задачи + `subtasks: [{text, is_completed?}]`, `tags: [uuid]` | `201`; `deadline` обязателен (ISO строка) |
| PATCH | `/tasks/:id` | любые поля частично | если переданы `subtasks` или `tags`, они заменяются целиком |
| DELETE | `/tasks/:id` | — | `204`, каскадно удаляет подзадачи и связи |

Нормализация: `recurrence_end_date: ""` → `null`; если `is_recurring: false`, все
поля повторения обнуляются; `recurrence_interval` принимает строку («2») и число.

## Categories

`{ id, user_id, name (1–100), icon (эмодзи), created_at }`

GET `/categories`, POST `/categories {name, icon}`, PATCH `/categories/:id {name, icon}`,
DELETE `/categories/:id` (задачи остаются с текстовым id категории).

## Tags

`{ id, user_id, name (1–50), color, created_at }`

GET `/tags`, POST `/tags {name, color}`, PATCH `/tags/:id {name, color}`,
DELETE `/tags/:id` (связи `task_tags` удаляются каскадно).

## Служебное

GET `/health` → `{ "ok": true }`.

## Примеры

```bash
A=http://127.0.0.1:3001/api; J='Content-Type: application/json'
curl -s -c c.txt -X POST $A/auth/register -H "$J" -d '{"email":"a@b.c","password":"Secret1!"}'
curl -s -b c.txt -X POST $A/tasks -H "$J" \
  -d '{"text":"Пример","deadline":"2026-09-20T18:00:00+05:00","subtasks":[{"text":"шаг"}],"tags":[]}'
curl -s -b c.txt $A/tasks
```
