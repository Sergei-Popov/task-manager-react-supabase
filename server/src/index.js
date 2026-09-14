import { createApp } from "./app.js";
import { runMigrations } from "./migrate.js";
import { pool } from "./db.js";

const PORT = Number(process.env.PORT) || 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase(attempts = 30) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query("select 1");
      return;
    } catch (error) {
      console.log(`БД недоступна (${i}/${attempts}): ${error.message}`);
      await sleep(2000);
    }
  }
  throw new Error("Не удалось подключиться к базе данных");
}

await waitForDatabase();
await runMigrations();

const app = createApp();
app.listen(PORT, () => {
  console.log(`API слушает порт ${PORT}`);
});

// Чистим протухшие сессии раз в час
setInterval(
  () => {
    pool
      .query("delete from sessions where expires_at < now()")
      .catch((error) => console.error("Не удалось почистить сессии:", error));
  },
  60 * 60 * 1000,
).unref();
