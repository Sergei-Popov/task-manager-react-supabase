export const DEFAULT_CATEGORIES = [
  { id: "work", name: "Работа", icon: "💼" },
  { id: "personal", name: "Личное", icon: "🏠" },
  { id: "study", name: "Учёба", icon: "📚" },
  { id: "health", name: "Здоровье", icon: "💪" },
  { id: "shopping", name: "Покупки", icon: "🛒" },
];

export const AVAILABLE_ICONS = [
  "💼",
  "🏠",
  "📚",
  "💪",
  "🛒",
  "🎯",
  "🎨",
  "🎮",
  "🎵",
  "🎬",
  "✈️",
  "🚗",
  "💰",
  "📱",
  "💻",
  "📧",
  "📞",
  "🍽️",
  "🏃",
  "🎁",
  "❤️",
  "⭐",
  "🔥",
  "💡",
  "🎉",
  "📝",
  "🔔",
  "🌟",
  "🚀",
  "🏆",
];

export const COLORS = [
  "#6366f1", // Индиго
  "#8b5cf6", // Фиолетовый
  "#ec4899", // Розовый
  "#ef4444", // Красный
  "#f97316", // Оранжевый
  "#eab308", // Жёлтый
  "#22c55e", // Зелёный
  "#14b8a6", // Бирюзовый
  "#3b82f6", // Синий
  "#64748b", // Серый
];

export const INITIAL_TASK_STATE = {
  text: "",
  deadline: "",
  category: "work",
  color: "#6366f1",
  status: "todo",
  priority: "medium",
  is_recurring: false,
  recurrence_type: null,
  recurrence_interval: 1,
  recurrence_end_date: null,
  subtasks: [],
  tags: [],
};

export const INITIAL_CATEGORY_STATE = {
  name: "",
  icon: "🎯",
};

export const TASK_STATUSES = {
  todo: { id: "todo", name: "К выполнению", icon: "📋", color: "#6366f1" },
  in_progress: {
    id: "in_progress",
    name: "В работе",
    icon: "⏳",
    color: "#f97316",
  },
  done: { id: "done", name: "Завершено", icon: "✅", color: "#22c55e" },
};

export const TASK_PRIORITIES = {
  low: { id: "low", name: "Низкий", icon: "🔽", color: "#64748b" },
  medium: { id: "medium", name: "Средний", icon: "➡️", color: "#f97316" },
  high: { id: "high", name: "Высокий", icon: "🔼", color: "#ef4444" },
};

export const RECURRENCE_TYPES = {
  daily: { id: "daily", name: "Ежедневно", icon: "📅" },
  weekly: { id: "weekly", name: "Еженедельно", icon: "📆" },
  monthly: { id: "monthly", name: "Ежемесячно", icon: "🗓️" },
  yearly: { id: "yearly", name: "Ежегодно", icon: "📅" },
};
