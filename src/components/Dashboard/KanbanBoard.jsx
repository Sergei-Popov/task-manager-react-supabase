import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { TASK_STATUSES } from "./constants.js";
import KanbanColumn from "./KanbanColumn.jsx";
import { KanbanCardBody } from "./KanbanCard.jsx";

function KanbanBoard({
  tasks,
  isLoading,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  getCategoryInfo,
  getTimeRemaining,
  truncateText,
  onCreate,
  tags = [],
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Статус, над которым находится перетаскиваемая карточка:
  // либо сама колонка, либо статус карточки, над которой зависли
  const resolveStatus = (overId) => {
    if (Object.keys(TASK_STATUSES).includes(overId)) return overId;
    return tasks.find((t) => t.id === overId)?.status;
  };

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const newStatus = resolveStatus(over.id);
    const task = tasks.find((t) => t.id === active.id);
    if (newStatus && task && task.status !== newStatus) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.values(TASK_STATUSES).map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={tasks.filter((task) => task.status === status.id)}
            isLoading={isLoading}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            getCategoryInfo={getCategoryInfo}
            getTimeRemaining={getTimeRemaining}
            truncateText={truncateText}
            onCreate={onCreate}
            tags={tags}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <Card size="sm" className="gap-2 p-3 shadow-xl ring-2 ring-ring/40">
            <KanbanCardBody
              task={activeTask}
              category={getCategoryInfo(activeTask.category)}
              timeRemaining={getTimeRemaining(activeTask.deadline)}
              truncateText={truncateText}
              tags={tags}
            />
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
