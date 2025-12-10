import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { TASK_PRIORITIES } from "./constants.js";

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

  const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium;

  // Получаем информацию о тегах задачи
  const taskTagIds = task.task_tags?.map((tt) => tt.tag_id) || [];
  const taskTags = tags.filter((tag) => taskTagIds.includes(tag.id));

  // Считаем прогресс подзадач
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.is_completed).length || 0;

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
        <div className={styles.kanbanCardBadges}>
          {task.priority && task.priority !== "medium" && (
            <span
              className={`${styles.priorityIndicator} ${
                task.priority === "high"
                  ? styles.priorityHigh
                  : styles.priorityLow
              }`}
            >
              {priority.icon}
            </span>
          )}
          {task.is_recurring && (
            <span className={styles.recurrenceBadge}>🔄</span>
          )}
          {subtasksCount > 0 && (
            <span className={styles.subtasksBadge}>
              ☑ {completedSubtasks}/{subtasksCount}
            </span>
          )}
        </div>
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

      {taskTags.length > 0 && (
        <div className={styles.taskTags}>
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className={styles.taskTag}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

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
