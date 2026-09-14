import { useState } from "react";
import {
  ArrowUp,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TASK_STATUSES } from "./constants.js";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const timeOf = (value) =>
  new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isOverdue = (task) =>
  task.status !== "done" && new Date(task.deadline) < new Date();

function CalendarView({ tasks, onView }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = воскресенье
  const leadingEmpty = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const tasksForDay = (day) =>
    tasks.filter((task) => {
      const d = new Date(task.deadline);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const daysWithTasks = days
    .map((day) => ({ day, tasks: tasksForDay(day) }))
    .filter(({ day, tasks: t }) => t.length > 0 || isToday(day));

  const formatDayDate = (day) =>
    new Date(year, month, day).toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const TaskChip = ({ task, full = false }) => (
    <button
      type="button"
      onClick={() => onView(task)}
      title={task.text}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md border-l-2 bg-muted/60 px-1.5 py-1 text-left text-xs transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        task.status === "done" && "text-muted-foreground line-through",
        !full && "min-w-0",
      )}
      style={{ borderLeftColor: task.color }}
    >
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {timeOf(task.deadline)}
      </span>
      <span className={cn("flex-1", full ? "" : "truncate")}>{task.text}</span>
      {task.priority === "high" && (
        <ArrowUp
          className="size-3 shrink-0 text-red-500"
          aria-label="Высокий приоритет"
        />
      )}
      {full && task.is_recurring && (
        <Repeat
          className="size-3 shrink-0 text-muted-foreground"
          aria-label="Повторяется"
        />
      )}
    </button>
  );

  return (
    <Card className="gap-0 p-0">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-2 border-b p-3 sm:p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft />
        </Button>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Сегодня
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          aria-label="Следующий месяц"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Сетка (планшет и десктоп) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: leadingEmpty }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-28 border-r border-b bg-muted/20 last:border-r-0"
            />
          ))}
          {days.map((day) => {
            const dayTasks = tasksForDay(day);
            const overdue = dayTasks.some(isOverdue);
            return (
              <div
                key={day}
                className={cn(
                  "flex min-h-28 flex-col gap-1 border-r border-b p-1.5 [&:nth-child(7n)]:border-r-0",
                  isToday(day) && "bg-primary/10",
                  overdue && "bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "mb-0.5 inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {day}
                </span>
                {dayTasks.slice(0, 3).map((task) => (
                  <TaskChip key={task.id} task={task} />
                ))}
                {dayTasks.length > 3 && (
                  <span className="px-1 text-xs text-muted-foreground">
                    +{dayTasks.length - 3} ещё
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Список (мобильный) */}
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {daysWithTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <CalendarX2 className="size-8" aria-hidden="true" />
            <p className="text-sm">Нет задач на этот месяц</p>
          </div>
        ) : (
          daysWithTasks.map(({ day, tasks: dayTasks }) => (
            <div
              key={day}
              className={cn(
                "rounded-lg border p-3",
                isToday(day) && "border-primary/60 bg-primary/5",
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold capitalize">
                  {formatDayDate(day)}
                </span>
                {isToday(day) && <Badge>Сегодня</Badge>}
                {dayTasks.some(isOverdue) && (
                  <Badge variant="destructive">Просрочено</Badge>
                )}
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет задач</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayTasks.map((task) => (
                    <TaskChip key={task.id} task={task} full />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
        {Object.values(TASK_STATUSES).map((status) => (
          <span key={status.id} className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            {status.name}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500" />
          Просрочено
        </span>
      </div>
    </Card>
  );
}

export default CalendarView;
