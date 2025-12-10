import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import DateTimePicker from "../DateTimePicker/DateTimePicker.jsx";
import { DEFAULT_CATEGORIES, COLORS, TASK_STATUSES } from "./constants.js";

function TaskViewModal({
  isOpen,
  onClose,
  selectedTask,
  isEditMode,
  newTask,
  setNewTask,
  categories,
  onUpdate,
  onEdit,
  isLoading,
  getCategoryInfo,
  getTimeRemaining,
}) {
  if (!isOpen || !selectedTask) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setNewTask((prev) => ({ ...prev, color }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditMode ? "Редактирование задачи" : "Просмотр задачи"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          {isEditMode ? (
            <form onSubmit={onUpdate} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="editText">Текст задачи</label>
                <textarea
                  id="editText"
                  name="text"
                  value={newTask.text}
                  onChange={handleInputChange}
                  placeholder="Введите описание задачи..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Срок выполнения</label>
                <DateTimePicker
                  value={newTask.deadline}
                  onChange={(value) =>
                    setNewTask((prev) => ({ ...prev, deadline: value }))
                  }
                  placeholder="Выберите дату и время"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editCategory">Категория</label>
                <select
                  id="editCategory"
                  name="category"
                  value={newTask.category}
                  onChange={handleInputChange}
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editStatus">Статус</label>
                <select
                  id="editStatus"
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                >
                  {Object.values(TASK_STATUSES).map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.icon} {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Цвет задачи</label>
                <div className={styles.colorPicker}>
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorOption} ${newTask.color === color ? styles.selected : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Сохраняю..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.taskView}>
              <div
                className={styles.taskViewHeader}
                style={{ borderLeftColor: selectedTask.color }}
              >
                <span
                  className={styles.taskViewStatus}
                  style={{
                    backgroundColor:
                      TASK_STATUSES[selectedTask.status]?.color || "#6366f1",
                  }}
                >
                  {TASK_STATUSES[selectedTask.status]?.icon}{" "}
                  {TASK_STATUSES[selectedTask.status]?.name || "К выполнению"}
                </span>
                <span className={styles.taskViewCategory}>
                  {getCategoryInfo(selectedTask.category).icon}{" "}
                  {getCategoryInfo(selectedTask.category).name}
                </span>
              </div>

              <div className={styles.taskViewContent}>
                <p className={styles.taskViewText}>{selectedTask.text}</p>
              </div>

              <div className={styles.taskViewDetails}>
                <div className={styles.taskViewDetail}>
                  <span className={styles.taskViewDetailLabel}>
                    📅 Срок выполнения:
                  </span>
                  <span className={styles.taskViewDetailValue}>
                    {new Date(selectedTask.deadline).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={styles.taskViewDetail}>
                  <span className={styles.taskViewDetailLabel}>
                    🕐 Осталось времени:
                  </span>
                  <span
                    className={`${styles.taskViewDetailValue} ${getTimeRemaining(selectedTask.deadline).isOverdue ? styles.overdue : ""}`}
                  >
                    {getTimeRemaining(selectedTask.deadline).text}
                  </span>
                </div>
                <div className={styles.taskViewDetail}>
                  <span className={styles.taskViewDetailLabel}>
                    📝 Создано:
                  </span>
                  <span className={styles.taskViewDetailValue}>
                    {new Date(selectedTask.created_at).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={() => onEdit(selectedTask)}
                >
                  ✏️ Редактировать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskViewModal;
