// Группировка задач по срокам для списка.

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const BUCKETS = [
  { id: "overdue", title: "Просрочено", tone: "destructive" },
  { id: "today", title: "Сегодня", tone: "primary" },
  { id: "tomorrow", title: "Завтра" },
  { id: "week", title: "На этой неделе" },
  { id: "later", title: "Позже" },
  { id: "done", title: "Завершено", tone: "muted" },
];

export function bucketOf(task, now = new Date()) {
  if (task.status === "done") return "done";
  const deadline = new Date(task.deadline);
  const today = startOfDay(now);
  if (deadline < now) return "overdue";
  if (deadline < addDays(today, 1)) return "today";
  if (deadline < addDays(today, 2)) return "tomorrow";
  if (deadline < addDays(today, 7)) return "week";
  return "later";
}

export function groupTasks(tasks, now = new Date()) {
  const map = Object.fromEntries(BUCKETS.map((b) => [b.id, []]));
  for (const task of tasks) map[bucketOf(task, now)].push(task);
  return BUCKETS.map((b) => ({ ...b, tasks: map[b.id] })).filter(
    (b) => b.tasks.length > 0,
  );
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const SORTERS = {
  deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
  priority: (a, b) =>
    (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1) ||
    new Date(a.deadline) - new Date(b.deadline),
  created: (a, b) => new Date(b.created_at) - new Date(a.created_at),
};

// Локальная дата в ISO с таймзоной (тот же формат, что у DateTimePicker)
export function toLocalIso(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

// Дедлайн по умолчанию для быстрого добавления: сегодня 18:00,
// а если уже позже, то завтра 18:00
export function defaultDeadline(now = new Date()) {
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    18,
    0,
    0,
  );
  if (d <= now) d.setDate(d.getDate() + 1);
  return toLocalIso(d);
}
