import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

// Простой раннер: применяет *.sql из migrations/ по алфавиту,
// запоминая применённые в schema_migrations.
export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      create table if not exists schema_migrations (
        name        text primary key,
        applied_at  timestamptz not null default now()
      )
    `);
    // Блокировка на случай одновременного старта нескольких инстансов
    await client.query("select pg_advisory_lock(727272)");

    const { rows } = await client.query("select name from schema_migrations");
    const applied = new Set(rows.map((r) => r.name));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`Применяю миграцию ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [
          file,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    await client.query("select pg_advisory_unlock(727272)");
  } finally {
    client.release();
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runMigrations()
    .then(() => {
      console.log("Миграции применены");
      return pool.end();
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
