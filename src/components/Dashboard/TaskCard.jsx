import {
  CalendarDays,
  Check,
  Circle,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PriorityIcon, RecurrenceIcon, StatusIcon } from "@/lib/icons.jsx";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, TASK_PRIORITIES } from "./constants.js";

export function TaskBadges({ task, className }) {
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.is_completed).length || 0;
  const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {task.priority && task.priority !== "medium" && (
        <Badge
          variant="outline"
          className="gap-1"
          style={{ color: priority.color, borderColor: priority.color }}
        >
          <PriorityIcon priority={task.priority} className="size-3" />
          {priority.name}
        </Badge>
      )}
      {task.is_recurring && (
        <Badge variant="secondary" className="gap-1">
          <RecurrenceIcon className="size-3" aria-hidden="true" />
          Повтор
        </Badge>
      )}
      {subtasksCount > 0 && (
        <Badge variant="secondary">
          {completedSubtasks}/{subtasksCount}
        </Badge>
      )}
    </div>
  );
}

export function TaskTags({ task, tags, className }) {
  const ids = task.task_tags?.map((tt) => tt.tag_id) || [];
  const taskTags = tags.filter((tag) => ids.includes(tag.id));
  if (taskTags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {taskTags.map((tag) => (
        <Badge
          key={tag.id}
          className="border-transparent text-white"
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}

// Кнопка-кружок «выполнено» в стиле таск-менеджеров
export function DoneToggle({ done, onToggle, className }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? "Вернуть в работу" : "Отметить выполненной"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "group/done flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            done
              ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
              : "border-muted-foreground/40 text-transparent hover:border-green-500 hover:text-green-500",
            className,
          )}
        >
          {done ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <Check
              className="size-3.5 opacity-0 transition-opacity group-hover/done:opacity-100"
              strokeWidth={3}
            />
          )}
          <Circle className="sr-only" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{done ? "Вернуть в работу" : "Выполнено"}</TooltipContent>
    </Tooltip>
  );
}

function TaskCard({
  task,
  category,
  timeRemaining,
  onStatusChange,
  onToggleDone,
  onView,
  onEdit,
  onDelete,
  truncateText,
  tags = [],
}) {
  const currentStatus = TASK_STATUSES[task.status] || TASK_STATUSES.todo;
  const isDone = task.status === "done";
  const isOverdue = !isDone && timeRemaining.isOverdue;
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.is_completed).length || 0;
  const progress = subtasksCount
    ? Math.round((completedSubtasks / subtasksCount) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "group/card gap-0 py-0 transition-colors hover:bg-accent/40",
        isDone && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <DoneToggle
          done={isDone}
          onToggle={() => onToggleDone(task)}
          className="mt-0.5"
        />

        <button
          type="button"
          className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => onView(task)}
        >
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h4
              className={cn(
                "text-[15px] font-medium leading-snug",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {truncateText(task.text)}
            </h4>
            <TaskBadges task={task} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: task.color }}
                aria-hidden="true"
              />
              <span aria-hidden="true">{category.icon}</span>
              {category.name}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1",
                isOverdue && "font-medium text-destructive",
              )}
            >
              <Timer className="size-3.5" aria-hidden="true" />
              {timeRemaining.text}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {new Date(task.deadline).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <TaskTags task={task} tags={tags} className="mt-2" />

          {subtasksCount > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <Progress
                value={progress}
                className="h-1.5 flex-1"
                aria-label="Прогресс подзадач"
              />
              <span className="text-xs tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>
          )}
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value)}
          >
            <SelectTrigger
              size="sm"
              className="w-fit border-transparent font-medium text-white dark:bg-transparent"
              style={{ backgroundColor: currentStatus.color }}
              aria-label="Статус задачи"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(TASK_STATUSES).map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <StatusIcon status={status.id} className="size-4" />
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover/card:opacity-100 focus-within:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(task)}
                >
                  <Pencil />
                  <span className="sr-only">Редактировать</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Редактировать</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 />
                  <span className="sr-only">Удалить</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Удалить</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TaskCard;
