import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  ListTodo,
  Minus,
  Repeat,
} from "lucide-react";

// Иконки статусов, приоритетов и повторения (вместо эмодзи).
// Цвета совпадают с TASK_STATUSES / TASK_PRIORITIES в constants.js.

export const STATUS_ICONS = {
  todo: ListTodo,
  in_progress: Clock,
  done: CheckCircle2,
};

export const PRIORITY_ICONS = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
};

export const RecurrenceIcon = Repeat;

export function StatusIcon({ status, className }) {
  const Icon = STATUS_ICONS[status] || ListTodo;
  return <Icon className={className} aria-hidden="true" />;
}

export function PriorityIcon({ priority, className }) {
  const Icon = PRIORITY_ICONS[priority] || Minus;
  return <Icon className={className} aria-hidden="true" />;
}
