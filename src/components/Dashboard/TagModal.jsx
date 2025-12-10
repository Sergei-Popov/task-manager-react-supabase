import { useState } from "react";
import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { COLORS } from "./constants.js";

function TagModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  isLoading,
}) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);
  const [editingTag, setEditingTag] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    if (editingTag) {
      onUpdateTag(editingTag.id, newTagName.trim(), newTagColor);
      setEditingTag(null);
    } else {
      onCreateTag(newTagName.trim(), newTagColor);
    }
    setNewTagName("");
    setNewTagColor(COLORS[0]);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor(COLORS[0]);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Управление тегами</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="tagName">
                {editingTag ? "Редактировать тег" : "Новый тег"}
              </label>
              <div className={styles.tagInputRow}>
                <input
                  id="tagName"
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Название тега..."
                  required
                />
                <button
                  type="submit"
                  className={styles.tagAddButton}
                  disabled={isLoading || !newTagName.trim()}
                >
                  {editingTag ? "✓" : "+"}
                </button>
                {editingTag && (
                  <button
                    type="button"
                    className={styles.tagCancelButton}
                    onClick={handleCancelEdit}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Цвет тега</label>
              <div className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorOption} ${newTagColor === color ? styles.selected : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
          </form>

          <div className={styles.tagsList}>
            <h4>Существующие теги</h4>
            {tags.length === 0 ? (
              <p className={styles.emptyTagsText}>Теги ещё не созданы</p>
            ) : (
              <div className={styles.tagsListItems}>
                {tags.map((tag) => (
                  <div key={tag.id} className={styles.tagListItem}>
                    <span
                      className={styles.tagPreview}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <div className={styles.tagListActions}>
                      <button
                        type="button"
                        onClick={() => handleEdit(tag)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTag(tag.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={onClose}
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TagModal;
