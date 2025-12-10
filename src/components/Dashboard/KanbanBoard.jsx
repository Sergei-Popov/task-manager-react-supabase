import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { TASK_STATUSES } from "./constants.js";
import KanbanColumn from "./KanbanColumn.jsx";

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
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Проверяем, является ли overId статусом колонки
    const isOverColumn = Object.keys(TASK_STATUSES).includes(overId);

    let newStatus;
    if (isOverColumn) {
      newStatus = overId;
    } else {
      // Если бросили на карточку, берём статус этой карточки
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        onStatusChange(taskId, newStatus);
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Определяем новый статус
    const isOverColumn = Object.keys(TASK_STATUSES).includes(over.id);
    let newStatus;

    if (isOverColumn) {
      newStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Визуальное обновление при перетаскивании между колонками
    if (newStatus && activeTask.status !== newStatus) {
      // Можно добавить визуальную обратную связь здесь
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={styles.kanbanBoard}>
        {Object.values(TASK_STATUSES).map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status.id);
          return (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={columnTasks}
              isLoading={isLoading}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              getCategoryInfo={getCategoryInfo}
              getTimeRemaining={getTimeRemaining}
              truncateText={truncateText}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className={`${styles.kanbanCard} ${styles.dragging}`}
            style={{ borderLeftColor: activeTask.color }}
          >
            <div className={styles.kanbanCardHeader}>
              <span className={styles.kanbanCardCategory}>
                {getCategoryInfo(activeTask.category).icon}{" "}
                {getCategoryInfo(activeTask.category).name}
              </span>
            </div>
            <p className={styles.kanbanCardText}>
              {truncateText(activeTask.text, 100)}
            </p>
            <div className={styles.kanbanCardFooter}>
              <span
                className={`${styles.kanbanCardDeadline} ${
                  getTimeRemaining(activeTask.deadline).isOverdue
                    ? styles.overdue
                    : ""
                }`}
              >
                🕐 {getTimeRemaining(activeTask.deadline).text}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
