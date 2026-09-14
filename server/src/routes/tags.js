import { Router } from "express";
import { query } from "../db.js";
import { validateBody, uuidParam } from "../validate.js";

const schema = {
  name: { type: "string", trim: true, min: 1, max: 50 },
  color: { type: "string", max: 20, default: "#6366f1" },
};

export const tagsRouter = Router();

tagsRouter.get("/", async (req, res) => {
  const { rows } = await query(
    "select * from tags where user_id = $1 order by created_at asc",
    [req.user.id],
  );
  res.json(rows);
});

tagsRouter.post("/", validateBody(schema), async (req, res) => {
  const { rows } = await query(
    `insert into tags (user_id, name, color) values ($1, $2, $3) returning *`,
    [req.user.id, req.body.name, req.body.color],
  );
  res.status(201).json(rows[0]);
});

tagsRouter.patch(
  "/:id",
  uuidParam(),
  validateBody(schema),
  async (req, res) => {
    const { rows } = await query(
      `update tags set name = $3, color = $4
      where id = $1 and user_id = $2 returning *`,
      [req.params.id, req.user.id, req.body.name, req.body.color],
    );
    if (!rows[0]) return res.status(404).json({ error: "Тег не найден" });
    res.json(rows[0]);
  },
);

tagsRouter.delete("/:id", uuidParam(), async (req, res) => {
  const { rowCount } = await query(
    "delete from tags where id = $1 and user_id = $2",
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: "Тег не найден" });
  res.status(204).end();
});
