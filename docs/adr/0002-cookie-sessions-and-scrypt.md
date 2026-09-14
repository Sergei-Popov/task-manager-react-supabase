---
status: accepted
---

# Сессии в httpOnly-cookie и пароли через scrypt без внешних библиотек

Вместо JWT или библиотеки авторизации (Better Auth, Passport) сделали минимальную
свою: случайный токен сессии в httpOnly SameSite=Lax cookie, в базе хранится sha256
токена, пароли хешируются `scrypt` из `node:crypto`. Причины: ноль зависимостей,
мгновенный отзыв сессии удалением строки, отсутствие подтверждения email по решению
пользователя.

## Consequences

- CSRF закрыт сочетанием SameSite=Lax и требованием `Content-Type: application/json`
  на изменяющих запросах; форму с другого сайта отправить нельзя.
- Cookie `secure` выставляется по `req.secure` за прокси (`trust proxy`), поэтому по
  голому HTTP на IP приложение тоже работает.
