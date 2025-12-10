import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import { AVAILABLE_ICONS } from "./constants.js";

function CategoryModal({
  isOpen,
  onClose,
  isEditMode,
  newCategory,
  setNewCategory,
  onCreate,
  onUpdate,
  isLoading,
}) {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconSelect = (icon) => {
    setNewCategory((prev) => ({ ...prev, icon }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditMode ? "Редактирование категории" : "Новая категория"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          <form
            onSubmit={isEditMode ? onUpdate : onCreate}
            className={styles.form}
          >
            <div className={styles.formGroup}>
              <label htmlFor="categoryName">Название категории</label>
              <input
                id="categoryName"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                placeholder="Введите название категории..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Иконка категории</label>
              <div className={styles.iconPicker}>
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`${styles.iconOption} ${newCategory.icon === icon ? styles.selected : ""}`}
                    onClick={() => handleIconSelect(icon)}
                  >
                    {icon}
                  </button>
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
                {isLoading
                  ? "Сохранение..."
                  : isEditMode
                    ? "Сохранить изменения"
                    : "Создать категорию"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;
