import { CalendarDays, Pencil, Timer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

function TaskCard({
  task,
  category,
  timeRemaining,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  truncateText,
  tags = [],
}) {
  const currentStatus = TASK_STATUSES[task.status] || TASK_STATUSES.todo;
  const isDone = task.status === "done";

  return (
    <Card
      className={cn(
        "gap-0 border-l-4 py-0 transition-colors hover:border-primary/40",
        isDone && "opacity-70",
      )}
      style={{ borderLeftColor: task.color }}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <div className="sm:w-44 sm:shrink-0">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value)}
          >
            <SelectTrigger
              className="w-full border-transparent font-medium text-white"
              style={{ backgroundColor: currentStatus.color }}
              aria-label="Статус задачи"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TASK_STATUSES).map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <StatusIcon status={status.id} className="size-4" />
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => onView(task)}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4
              className={cn(
                "text-base font-semibold leading-snug",
                isDone && "line-through",
              )}
            >
              {truncateText(task.text)}
            </h4>
            <TaskBadges task={task} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">{category.icon}</span>
              {category.name}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1",
                timeRemaining.isOverdue && "font-medium text-destructive",
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
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <TaskTags task={task} tags={tags} className="mt-2" />
        </button>

        <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
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
                size="icon"
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
    </Card>
  );
}

export default TaskCard;
