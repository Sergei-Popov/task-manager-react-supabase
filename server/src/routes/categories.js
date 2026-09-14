import { Router } from "express";
import { query } from "../db.js";
import { validateBody, uuidParam } from "../validate.js";

const schema = {
  name: { type: "string", trim: true, min: 1, max: 100 },
  icon: { type: "string", min: 1, max: 16, default: "🎯" },
};

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res) => {
  const { rows } = await query(
    "select * from categories where user_id = $1 order by created_at asc",
    [req.user.id],
  );
  res.json(rows);
});

categoriesRouter.post("/", validateBody(schema), async (req, res) => {
  const { rows } = await query(
    `insert into categories (user_id, name, icon) values ($1, $2, $3) returning *`,
    [req.user.id, req.body.name, req.body.icon],
  );
  res.status(201).json(rows[0]);
});

categoriesRouter.patch(
  "/:id",
  uuidParam(),
  validateBody(schema),
  async (req, res) => {
    const { rows } = await query(
      `update categories set name = $3, icon = $4
        where id = $1 and user_id = $2 returning *`,
      [req.params.id, req.user.id, req.body.name, req.body.icon],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Категория не найдена" });
    res.json(rows[0]);
  },
);

categoriesRouter.delete("/:id", uuidParam(), async (req, res) => {
  const { rowCount } = await query(
    "delete from categories where id = $1 and user_id = $2",
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: "Категория не найдена" });
  res.status(204).end();
});
