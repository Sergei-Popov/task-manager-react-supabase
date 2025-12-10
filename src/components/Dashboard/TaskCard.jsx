import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { TASK_STATUSES, TASK_PRIORITIES } from "./constants.js";

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
      className={`${styles.taskCard} ${task.status === "done" ? styles.completed : ""}`}
      style={{ borderLeftColor: task.color }}
    >
      <div className={styles.statusSelector}>
        <select
          className={styles.statusSelect}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          style={{
            backgroundColor: currentStatus.color,
            color: "#fff",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.values(TASK_STATUSES).map((status) => (
            <option key={status.id} value={status.id}>
              {status.icon} {status.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.taskContent} onClick={() => onView(task)}>
        <div className={styles.taskHeader}>
          <h4 className={styles.taskText}>{truncateText(task.text)}</h4>
          <div className={styles.taskBadges}>
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
        </div>
        <div className={styles.taskMeta}>
          <span className={styles.taskCategory}>
            {category.icon} {category.name}
          </span>
          <span
            className={`${styles.taskDeadline} ${timeRemaining.isOverdue ? styles.overdue : ""}`}
          >
            🕐 {timeRemaining.text}
          </span>
          <span className={styles.taskDate}>
            📅{" "}
            {new Date(task.deadline).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
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
      </div>
      <div className={styles.taskActions}>
        <button className={styles.editButton} onClick={() => onEdit(task)}>
          ✏️
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(task.id)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
