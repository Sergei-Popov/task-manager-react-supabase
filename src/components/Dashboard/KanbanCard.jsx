import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";

function KanbanCard({
  task,
  category,
  timeRemaining,
  onView,
  onEdit,
  onDelete,
  truncateText,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: task.color,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.kanbanCard} ${isDragging ? styles.cardDragging : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.kanbanCardHeader}>
        <span className={styles.kanbanCardCategory}>
          {category.icon} {category.name}
        </span>
        <div className={styles.kanbanCardActions}>
          <button
            className={styles.kanbanCardBtn}
            onClick={(e) => {
              e.stopPropagation();
              onView(task);
            }}
            title="Просмотр"
          >
            👁️
          </button>
          <button
            className={styles.kanbanCardBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            className={styles.kanbanCardBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
      <p className={styles.kanbanCardText}>{truncateText(task.text, 100)}</p>
      <div className={styles.kanbanCardFooter}>
        <span
          className={`${styles.kanbanCardDeadline} ${
            timeRemaining.isOverdue ? styles.overdue : ""
          }`}
        >
          🕐 {timeRemaining.text}
        </span>
      </div>
    </div>
  );
}

export default KanbanCard;
