---
status: accepted
---

# Свой API и Postgres вместо Supabase

Проект начинался на Supabase (Auth + PostgREST + RLS). Облачный проект исчез, а
пользователь не хочет зависеть от BaaS. Решили держать всё своё: Express-API с чистым
`pg`, собственная авторизация и PostgreSQL в Docker Compose на VPS. Изоляция данных
теперь обеспечивается фильтром `user_id = req.user.id` в каждом запросе, а не RLS.

## Considered Options

- Supabase Cloud заново: отклонено, пользователь не хочет BaaS.
- Neon + Vercel Functions + Better Auth: отклонено, пользователь выбрал свой VPS.

## Consequences

- Имена полей ответа API (`subtasks`, `task_tags`) сохранены от схемы Supabase, чтобы
  не переписывать фронтенд.
- Любой новый SQL-запрос обязан фильтровать по пользователю.
