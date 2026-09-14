import {
  CalendarDays,
  CalendarPlus,
  Pencil,
  Repeat,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PriorityIcon, StatusIcon } from "@/lib/icons.jsx";
import { cn } from "@/lib/utils";
import TaskForm from "./TaskForm.jsx";
import { TaskTags } from "./TaskCard.jsx";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  RECURRENCE_TYPES,
} from "./constants.js";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function DetailRow({ icon, label, children, className }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("font-medium", className)}>{children}</span>
    </div>
  );
}

function TaskViewModal({
  isOpen,
  onClose,
  selectedTask,
  isEditMode,
  newTask,
  setNewTask,
  categories,
  tags = [],
  onUpdate,
  onEdit,
  isLoading,
  getCategoryInfo,
  getTimeRemaining,
  onToggleSubtask,
}) {
  const task = selectedTask;
  const status = task ? TASK_STATUSES[task.status] || TASK_STATUSES.todo : null;
  const priority = task
    ? TASK_PRIORITIES[task.priority || "medium"] || TASK_PRIORITIES.medium
    : null;
  const category = task ? getCategoryInfo(task.category) : null;
  const remaining = task ? getTimeRemaining(task.deadline) : null;

  return (
    <Dialog
      open={isOpen && Boolean(task)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        {task && isEditMode && (
          <>
            <DialogHeader>
              <DialogTitle>Редактирование задачи</DialogTitle>
              <DialogDescription>
                Измените поля и сохраните. Подзадачи можно отмечать
                выполненными.
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              idPrefix="edit"
              newTask={newTask}
              setNewTask={setNewTask}
              categories={categories}
              tags={tags}
              onSubmit={onUpdate}
              onCancel={onClose}
              submitLabel="Сохранить изменения"
              isLoading={isLoading}
              allowToggleSubtasks
            />
          </>
        )}

        {task && !isEditMode && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-6">
                <Badge
                  className="gap-1 border-transparent text-white"
                  style={{ backgroundColor: status.color }}
                >
                  <StatusIcon status={task.status} className="size-3" />
                  {status.name}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1"
                  style={{ color: priority.color, borderColor: priority.color }}
                >
                  <PriorityIcon
                    priority={task.priority || "medium"}
                    className="size-3"
                  />
                  {priority.name}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <span aria-hidden="true">{category.icon}</span>
                  {category.name}
                </Badge>
              </div>
              <DialogTitle className="mt-2 text-xl leading-snug">
                {task.text}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Просмотр задачи
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/30 p-4">
              <TaskTags task={task} tags={tags} />
              {task.task_tags?.length === 0 || !task.task_tags ? (
                <p className="text-sm text-muted-foreground">Тегов нет</p>
              ) : null}
            </div>

            {task.subtasks?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Подзадачи</h4>
                <ul className="flex flex-col gap-1.5">
                  {[...task.subtasks]
                    .sort((a, b) => a.position - b.position)
                    .map((subtask) => (
                      <li
                        key={subtask.id}
                        className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                      >
                        <Checkbox
                          id={`view-subtask-${subtask.id}`}
                          checked={subtask.is_completed}
                          disabled={!onToggleSubtask || isLoading}
                          onCheckedChange={(checked) =>
                            onToggleSubtask?.(
                              task,
                              subtask.id,
                              checked === true,
                            )
                          }
                          aria-label={subtask.text}
                        />
                        <span
                          className={cn(
                            subtask.is_completed &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {subtask.text}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-3">
              <DetailRow icon={CalendarDays} label="Срок выполнения">
                {formatDateTime(task.deadline)}
              </DetailRow>
              <DetailRow
                icon={Timer}
                label="Осталось времени"
                className={remaining.isOverdue ? "text-destructive" : undefined}
              >
                {remaining.text}
              </DetailRow>
              {task.is_recurring && (
                <DetailRow icon={Repeat} label="Повторение">
                  {RECURRENCE_TYPES[task.recurrence_type]?.name || "Ежедневно"}{" "}
                  (каждые {task.recurrence_interval || 1})
                  {task.recurrence_end_date
                    ? `, до ${task.recurrence_end_date}`
                    : ""}
                </DetailRow>
              )}
              <DetailRow icon={CalendarPlus} label="Создано">
                {formatDateTime(task.created_at)}
              </DetailRow>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
              >
                Закрыть
              </Button>
              <Button type="button" size="lg" onClick={() => onEdit(task)}>
                <Pencil data-icon="inline-start" />
                Редактировать
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskViewModal;
