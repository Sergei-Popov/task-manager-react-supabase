import { Router } from "express";
import { query, withTransaction } from "../db.js";
import { validateBody, uuidParam } from "../validate.js";

const TASK_SELECT = `
  select t.*,
         coalesce((
           select json_agg(json_build_object(
                    'id', s.id, 'text', s.text,
                    'is_completed', s.is_completed, 'position', s.position)
                  order by s.position)
             from subtasks s where s.task_id = t.id), '[]'::json) as subtasks,
         coalesce((
           select json_agg(json_build_object('tag_id', tt.tag_id))
             from task_tags tt where tt.task_id = t.id), '[]'::json) as task_tags
    from tasks t
`;

async function getTask(db, id, userId) {
  const { rows } = await db.query(
    `${TASK_SELECT} where t.id = $1 and t.user_id = $2`,
    [id, userId],
  );
  return rows[0] || null;
}

async function replaceSubtasks(db, taskId, subtasks) {
  await db.query("delete from subtasks where task_id = $1", [taskId]);
  for (const [index, subtask] of subtasks.entries()) {
    await db.query(
      `insert into subtasks (task_id, text, is_completed, position)
       values ($1, $2, $3, $4)`,
      [taskId, subtask.text, subtask.is_completed ?? false, index],
    );
  }
}

async function replaceTags(db, taskId, userId, tagIds) {
  await db.query("delete from task_tags where task_id = $1", [taskId]);
  if (tagIds.length === 0) return;
  // Привязываем только теги, принадлежащие пользователю
  await db.query(
    `insert into task_tags (task_id, tag_id)
     select $1, id from tags where user_id = $2 and id = any($3::uuid[])
     on conflict do nothing`,
    [taskId, userId, tagIds],
  );
}

const emptyToNull = (value) => (value === "" ? null : value);

const taskFields = {
  text: { type: "string", trim: true, min: 1, max: 2000 },
  deadline: { type: "date", convert: true },
  category: { type: "string", max: 100, default: "work" },
  color: { type: "string", max: 20, default: "#6366f1" },
  status: {
    type: "enum",
    values: ["todo", "in_progress", "done"],
    default: "todo",
  },
  priority: {
    type: "enum",
    values: ["low", "medium", "high"],
    default: "medium",
  },
  is_recurring: { type: "boolean", convert: true, default: false },
  recurrence_type: {
    type: "enum",
    values: ["daily", "weekly", "monthly", "yearly"],
    nullable: true,
    optional: true,
  },
  recurrence_interval: {
    type: "number",
    integer: true,
    min: 1,
    convert: true,
    nullable: true,
    optional: true,
  },
  recurrence_end_date: {
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    nullable: true,
    optional: true,
  },
};

const subtasksField = {
  type: "array",
  optional: true,
  items: {
    type: "object",
    props: {
      text: { type: "string", trim: true, min: 1, max: 500 },
      is_completed: { type: "boolean", convert: true, default: false },
    },
  },
};

const tagsField = {
  type: "array",
  optional: true,
  items: { type: "uuid" },
};

const createSchema = {
  ...taskFields,
  subtasks: subtasksField,
  tags: tagsField,
};

// Для обновления все поля необязательны
const updateSchema = Object.fromEntries(
  Object.entries(createSchema).map(([key, rule]) => [
    key,
    { ...rule, optional: true, default: undefined },
  ]),
);

const TASK_COLUMNS = Object.keys(taskFields);

// Пустая строка из <input type="date"> означает «дата не задана»
const normalizeTaskBody = (req, res, next) => {
  if (req.body && req.body.recurrence_end_date === "") {
    req.body.recurrence_end_date = null;
  }
  next();
};

export const tasksRouter = Router();
tasksRouter.use(normalizeTaskBody);

tasksRouter.get("/", async (req, res) => {
  const { rows } = await query(
    `${TASK_SELECT} where t.user_id = $1 order by t.deadline asc`,
    [req.user.id],
  );
  res.json(rows);
});

tasksRouter.post("/", validateBody(createSchema), async (req, res) => {
  const body = req.body;
  const isRecurring = Boolean(body.is_recurring);

  const task = await withTransaction(async (db) => {
    const { rows } = await db.query(
      `insert into tasks (user_id, text, deadline, category, color, status, priority,
                          is_recurring, recurrence_type, recurrence_interval, recurrence_end_date)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning id`,
      [
        req.user.id,
        body.text,
        body.deadline,
        body.category,
        body.color,
        body.status,
        body.priority,
        isRecurring,
        isRecurring ? body.recurrence_type || "daily" : null,
        isRecurring ? body.recurrence_interval || 1 : null,
        isRecurring ? emptyToNull(body.recurrence_end_date) : null,
      ],
    );
    const id = rows[0].id;
    await replaceSubtasks(db, id, body.subtasks || []);
    await replaceTags(db, id, req.user.id, body.tags || []);
    return getTask(db, id, req.user.id);
  });

  res.status(201).json(task);
});

tasksRouter.patch(
  "/:id",
  uuidParam(),
  validateBody(updateSchema),
  async (req, res) => {
    const body = req.body;

    const task = await withTransaction(async (db) => {
      const existing = await getTask(db, req.params.id, req.user.id);
      if (!existing) return null;

      const merged = { ...existing, ...body };
      const isRecurring = Boolean(merged.is_recurring);
      const values = {
        text: merged.text,
        deadline: merged.deadline,
        category: merged.category,
        color: merged.color,
        status: merged.status,
        priority: merged.priority,
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? merged.recurrence_type || "daily" : null,
        recurrence_interval: isRecurring
          ? merged.recurrence_interval || 1
          : null,
        recurrence_end_date: isRecurring
          ? emptyToNull(merged.recurrence_end_date)
          : null,
      };

      const setClause = TASK_COLUMNS.map((col, i) => `${col} = $${i + 3}`).join(
        ", ",
      );
      await db.query(
        `update tasks set ${setClause}, updated_at = now()
          where id = $1 and user_id = $2`,
        [req.params.id, req.user.id, ...TASK_COLUMNS.map((c) => values[c])],
      );

      if (body.subtasks) await replaceSubtasks(db, existing.id, body.subtasks);
      if (body.tags) await replaceTags(db, existing.id, req.user.id, body.tags);
      return getTask(db, existing.id, req.user.id);
    });

    if (!task) return res.status(404).json({ error: "Задача не найдена" });
    res.json(task);
  },
);

tasksRouter.delete("/:id", uuidParam(), async (req, res) => {
  const { rowCount } = await query(
    "delete from tasks where id = $1 and user_id = $2",
    [req.params.id, req.user.id],
  );
  if (!rowCount) return res.status(404).json({ error: "Задача не найдена" });
  res.status(204).end();
});
