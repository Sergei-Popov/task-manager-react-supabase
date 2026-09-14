import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIcon } from "@/lib/icons.jsx";
import { cn } from "@/lib/utils";
import KanbanCard from "./KanbanCard.jsx";

function KanbanColumn({
  status,
  tasks,
  isLoading,
  onView,
  onEdit,
  onDelete,
  getCategoryInfo,
  getTimeRemaining,
  truncateText,
  tags = [],
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <section
      aria-label={status.name}
      className={cn(
        "flex min-h-72 flex-col rounded-xl border bg-card/60 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <header
        className="flex items-center gap-2 border-b-2 px-4 py-3"
        style={{ borderBottomColor: status.color }}
      >
        <StatusIcon status={status.id} className="size-4" />
        <h3 className="font-semibold">{status.name}</h3>
        <Badge variant="secondary" className="ml-auto">
          {tasks.length}
        </Badge>
      </header>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 p-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Перетащите задачу сюда
          </div>
        ) : (
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                category={getCategoryInfo(task.category)}
                timeRemaining={getTimeRemaining(task.deadline)}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                truncateText={truncateText}
                tags={tags}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  );
}

export default KanbanColumn;
