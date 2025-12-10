import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import DateTimePicker from "../DateTimePicker/DateTimePicker.jsx";
import { DEFAULT_CATEGORIES, COLORS, TASK_STATUSES } from "./constants.js";

function TaskModal({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  categories,
  onSubmit,
  isLoading,
}) {
  if (!isOpen) return null;

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
          <h2>Новая задача</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="text">Текст задачи</label>
              <textarea
                id="text"
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
              <label htmlFor="category">Категория</label>
              <select
                id="category"
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
              <label htmlFor="status">Статус</label>
              <select
                id="status"
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
                {isLoading ? "Создание..." : "Создать задачу"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
