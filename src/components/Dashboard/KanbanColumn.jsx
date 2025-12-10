import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";
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
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <div
      className={`${styles.kanbanColumn} ${isOver ? styles.columnOver : ""}`}
    >
      <div
        className={styles.kanbanColumnHeader}
        style={{ borderColor: status.color }}
      >
        <span className={styles.kanbanColumnIcon}>{status.icon}</span>
        <span className={styles.kanbanColumnTitle}>{status.name}</span>
        <span className={styles.kanbanColumnCount}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={styles.kanbanColumnContent}>
        {isLoading ? (
          <div className={styles.kanbanEmptyState}>Загрузка...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.kanbanEmptyState}>Перетащите задачу сюда</div>
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
    </div>
  );
}

export default KanbanColumn;
