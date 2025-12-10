import { useState } from "react";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import DateTimePicker from "../DateTimePicker/DateTimePicker.jsx";
import {
  DEFAULT_CATEGORIES,
  COLORS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  RECURRENCE_TYPES,
} from "./constants.js";

function TaskModal({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  categories,
  tags = [],
  onSubmit,
  isLoading,
}) {
  const [newSubtask, setNewSubtask] = useState("");
  const [showRecurrence, setShowRecurrence] = useState(newTask.is_recurring);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNewTask((prev) => ({ ...prev, [name]: checked }));
      if (name === "is_recurring") {
        setShowRecurrence(checked);
        if (!checked) {
          setNewTask((prev) => ({
            ...prev,
            recurrence_type: null,
            recurrence_interval: 1,
            recurrence_end_date: null,
          }));
        }
      }
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleColorSelect = (color) => {
    setNewTask((prev) => ({ ...prev, color }));
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setNewTask((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { text: newSubtask.trim(), is_completed: false },
      ],
    }));
    setNewSubtask("");
  };

  const handleRemoveSubtask = (index) => {
    setNewTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleTagToggle = (tagId) => {
    setNewTask((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalLarge}`}
        onClick={(e) => e.stopPropagation()}
      >
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

            <div className={styles.formRow}>
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
                <label htmlFor="priority">Приоритет</label>
                <select
                  id="priority"
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                >
                  {Object.values(TASK_PRIORITIES).map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.icon} {priority.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
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
            </div>

            {/* Повторяющаяся задача */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={newTask.is_recurring}
                  onChange={handleInputChange}
                />
                <span>🔄 Повторяющаяся задача</span>
              </label>
            </div>

            {showRecurrence && (
              <div className={styles.recurrenceSettings}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="recurrence_type">Повторять</label>
                    <select
                      id="recurrence_type"
                      name="recurrence_type"
                      value={newTask.recurrence_type || "daily"}
                      onChange={handleInputChange}
                    >
                      {Object.values(RECURRENCE_TYPES).map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="recurrence_interval">Каждые</label>
                    <input
                      type="number"
                      id="recurrence_interval"
                      name="recurrence_interval"
                      value={newTask.recurrence_interval}
                      onChange={handleInputChange}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="recurrence_end_date">
                    Повторять до (необязательно)
                  </label>
                  <input
                    type="date"
                    id="recurrence_end_date"
                    name="recurrence_end_date"
                    value={newTask.recurrence_end_date || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Подзадачи */}
            <div className={styles.formGroup}>
              <label>Подзадачи (чеклист)</label>
              <div className={styles.subtaskInput}>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Добавить подзадачу..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button type="button" onClick={handleAddSubtask}>
                  +
                </button>
              </div>
              {newTask.subtasks.length > 0 && (
                <ul className={styles.subtaskList}>
                  {newTask.subtasks.map((subtask, index) => (
                    <li key={index} className={styles.subtaskItem}>
                      <span>☐ {subtask.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Теги */}
            {tags.length > 0 && (
              <div className={styles.formGroup}>
                <label>Теги</label>
                <div className={styles.tagsPicker}>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`${styles.tagOption} ${newTask.tags.includes(tag.id) ? styles.selected : ""}`}
                      style={{
                        borderColor: tag.color,
                        backgroundColor: newTask.tags.includes(tag.id)
                          ? tag.color
                          : "transparent",
                      }}
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
