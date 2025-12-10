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

function TaskViewModal({
  isOpen,
  onClose,
  selectedTask,
  isEditMode,
  newTask,
  setNewTask,
  categories,
  tags = [],
  onUpdate,
  onEdit,
  isLoading,
  getCategoryInfo,
  getTimeRemaining,
}) {
  const [newSubtask, setNewSubtask] = useState("");
  const [showRecurrence, setShowRecurrence] = useState(false);

  if (!isOpen || !selectedTask) return null;

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

  const handleToggleSubtask = (index) => {
    setNewTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s, i) =>
        i === index ? { ...s, is_completed: !s.is_completed } : s,
      ),
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

  const getTagById = (tagId) => tags.find((t) => t.id === tagId);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalLarge}`}
        onClick={(e) => e.stopPropagation()}
      >
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
                  <label htmlFor="editPriority">Приоритет</label>
                  <select
                    id="editPriority"
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

              {(showRecurrence || newTask.is_recurring) && (
                <div className={styles.recurrenceSettings}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editRecurrenceType">Повторять</label>
                      <select
                        id="editRecurrenceType"
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
                      <label htmlFor="editRecurrenceInterval">Каждые</label>
                      <input
                        type="number"
                        id="editRecurrenceInterval"
                        name="recurrence_interval"
                        value={newTask.recurrence_interval}
                        onChange={handleInputChange}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="editRecurrenceEndDate">
                      Повторять до (необязательно)
                    </label>
                    <input
                      type="date"
                      id="editRecurrenceEndDate"
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
                      <li
                        key={index}
                        className={`${styles.subtaskItem} ${subtask.is_completed ? styles.subtaskItemCompleted : ""}`}
                      >
                        <span
                          onClick={() => handleToggleSubtask(index)}
                          style={{ cursor: "pointer" }}
                        >
                          {subtask.is_completed ? "☑" : "☐"} {subtask.text}
                        </span>
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
                <span
                  className={`${styles.priorityIndicator} ${
                    selectedTask.priority === "high"
                      ? styles.priorityHigh
                      : selectedTask.priority === "low"
                        ? styles.priorityLow
                        : styles.priorityMedium
                  }`}
                >
                  {TASK_PRIORITIES[selectedTask.priority || "medium"]?.icon}{" "}
                  {TASK_PRIORITIES[selectedTask.priority || "medium"]?.name}
                </span>
                <span className={styles.taskViewCategory}>
                  {getCategoryInfo(selectedTask.category).icon}{" "}
                  {getCategoryInfo(selectedTask.category).name}
                </span>
              </div>

              <div className={styles.taskViewContent}>
                <p className={styles.taskViewText}>{selectedTask.text}</p>

                {/* Теги задачи */}
                {selectedTask.task_tags?.length > 0 && (
                  <div className={styles.taskTags}>
                    {selectedTask.task_tags.map((tt) => {
                      const tag = getTagById(tt.tag_id);
                      return tag ? (
                        <span
                          key={tag.id}
                          className={styles.taskTag}
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Подзадачи */}
              {selectedTask.subtasks?.length > 0 && (
                <div className={styles.taskViewSubtasks}>
                  <h4>📋 Подзадачи</h4>
                  <ul className={styles.subtaskList}>
                    {selectedTask.subtasks
                      .sort((a, b) => a.position - b.position)
                      .map((subtask) => (
                        <li
                          key={subtask.id}
                          className={`${styles.subtaskItem} ${subtask.is_completed ? styles.subtaskItemCompleted : ""}`}
                        >
                          <span>
                            {subtask.is_completed ? "☑" : "☐"} {subtask.text}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

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
                {selectedTask.is_recurring && (
                  <div className={styles.taskViewDetail}>
                    <span className={styles.taskViewDetailLabel}>
                      🔄 Повторение:
                    </span>
                    <span className={styles.taskViewDetailValue}>
                      {RECURRENCE_TYPES[selectedTask.recurrence_type]?.name}{" "}
                      (каждые {selectedTask.recurrence_interval})
                    </span>
                  </div>
                )}
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
