# Деплой на VPS

Любой сервер с Docker (Ubuntu 22.04+, 1 CPU / 1 ГБ RAM).

```bash
curl -fsSL https://get.docker.com | sh
git clone https://github.com/Sergei-Popov/task-manager-react-supabase.git
cd task-manager-react-supabase
cp .env.example .env
nano .env      # POSTGRES_PASSWORD — длинная случайная строка
               # SITE_ADDRESS — домен (tasks.example.com) или :80 для работы по IP
docker compose up -d --build
```

- С доменом Caddy сам получает сертификат Let's Encrypt: нужны A-запись на сервер и
  открытые порты 80 и 443.
- Обновление: `git pull && docker compose up -d --build`.
- Логи: `docker compose logs -f api` / `web`.
- Бэкап: `docker compose exec db pg_dump -U tasks tasks > backup.sql`.
- Миграции применяет API при старте; отдельный шаг не нужен.
- Строку `ports` у `db` на сервере можно убрать, чтобы Postgres не торчал наружу.

Vercel больше не используется, проект там удалён.
