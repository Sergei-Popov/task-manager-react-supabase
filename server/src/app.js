import express from "express";
import { attachUser, requireAuth, authRouter } from "./auth.js";
import { tasksRouter } from "./routes/tasks.js";
import { categoriesRouter } from "./routes/categories.js";
import { tagsRouter } from "./routes/tags.js";

export function createApp() {
  const app = express();

  // За Caddy/nginx: чтобы req.secure и IP клиента были корректными
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(express.json({ limit: "200kb" }));

  // Защита от CSRF: cookie SameSite=Lax + изменяющие запросы принимаются
  // только с JSON-телом, которое кросс-сайтовая HTML-форма отправить не может.
  app.use((req, res, next) => {
    const mutating = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (
      mutating &&
      !req.is("application/json") &&
      req.headers["content-length"] > 0
    ) {
      return res.status(415).json({ error: "Ожидается application/json" });
    }
    next();
  });

  app.use(attachUser);

  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use("/api/tasks", requireAuth, tasksRouter);
  app.use("/api/categories", requireAuth, categoriesRouter);
  app.use("/api/tags", requireAuth, tagsRouter);

  app.use((req, res) => res.status(404).json({ error: "Не найдено" }));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Некорректный JSON" });
    }
    console.error(error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  });

  return app;
}
