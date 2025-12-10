import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { TASK_STATUSES } from "./constants.js";

function TaskCard({
  task,
  category,
  timeRemaining,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  truncateText,
}) {
  const currentStatus = TASK_STATUSES[task.status] || TASK_STATUSES.todo;

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
        <h4 className={styles.taskText}>{truncateText(task.text)}</h4>
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
