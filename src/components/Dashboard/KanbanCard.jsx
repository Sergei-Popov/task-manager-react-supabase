import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, GripVertical, Pencil, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskBadges, TaskTags } from "./TaskCard.jsx";

// Содержимое карточки без drag-логики: используется и в колонке, и в DragOverlay
export function KanbanCardBody({
  task,
  category,
  timeRemaining,
  truncateText,
  tags = [],
  onView,
  onEdit,
  onDelete,
  dragHandle,
}) {
  return (
    <>
      <div className="flex items-start gap-2">
        {dragHandle}
        <span className="inline-flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground">
          <span aria-hidden="true">{category.icon}</span>
          <span className="truncate">{category.name}</span>
        </span>
        {onView && (
          <div className="-mr-1 -mt-1 flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onView(task);
              }}
              aria-label="Просмотр"
            >
              <Eye />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              aria-label="Редактировать"
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:text-destructive"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              aria-label="Удалить"
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </div>
      <p
        className={cn(
          "text-sm font-medium leading-snug",
          task.status === "done" && "text-muted-foreground line-through",
        )}
      >
        {truncateText(task.text, 100)}
      </p>
      <TaskBadges task={task} />
      <TaskTags task={task} tags={tags} />
      <div
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          timeRemaining.isOverdue && "font-medium text-destructive",
        )}
      >
        <Timer className="size-3.5" aria-hidden="true" />
        {timeRemaining.text}
      </div>
    </>
  );
}

function KanbanCard({
  task,
  category,
  timeRemaining,
  onView,
  onEdit,
  onDelete,
  truncateText,
  tags = [],
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: task.color,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      size="sm"
      className="gap-2 border-l-4 p-3"
    >
      <KanbanCardBody
        task={task}
        category={category}
        timeRemaining={timeRemaining}
        truncateText={truncateText}
        tags={tags}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="-ml-1 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
            aria-label="Перетащить задачу"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </Card>
  );
}

export default KanbanCard;
