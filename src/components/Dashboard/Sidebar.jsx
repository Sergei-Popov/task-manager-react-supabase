import styles from "../../pages/DashboardPage/DashboardPage.module.css";
import SingOutButton from "../SingOutButton/SingOutButton.jsx";
import { DEFAULT_CATEGORIES } from "./constants.js";

function Sidebar({
  tasks,
  categories,
  filter,
  setFilter,
  isSidebarOpen,
  setIsSidebarOpen,
  userEmail,
  openCreateCategoryModal,
  openEditCategoryModal,
  handleDeleteCategory,
  stats,
}) {
  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✓</span>
            <span className={styles.logoText}>Мои задачи</span>
          </div>
          <button
            className={styles.closeSidebarButton}
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${filter === "all" ? styles.active : ""}`}
              onClick={() => setFilter("all")}
            >
              <span className={styles.navIcon}>📋</span>
              Все задачи
              <span className={styles.badge}>{stats.total}</span>
            </button>
            <button
              className={`${styles.navItem} ${filter === "todo" ? styles.active : ""}`}
              onClick={() => setFilter("todo")}
            >
              <span className={styles.navIcon}>📝</span>К выполнению
              <span className={styles.badge}>{stats.todo}</span>
            </button>
            <button
              className={`${styles.navItem} ${filter === "in_progress" ? styles.active : ""}`}
              onClick={() => setFilter("in_progress")}
            >
              <span className={styles.navIcon}>⏳</span>В работе
              <span className={styles.badge}>{stats.inProgress}</span>
            </button>
            <button
              className={`${styles.navItem} ${filter === "completed" ? styles.active : ""}`}
              onClick={() => setFilter("completed")}
            >
              <span className={styles.navIcon}>✅</span>
              Завершённые
              <span className={styles.badge}>{stats.completed}</span>
            </button>
          </nav>

          <div className={styles.categoriesSection}>
            <h3 className={styles.sectionTitle}>Категории</h3>
            {DEFAULT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`${styles.navItem} ${filter === category.id ? styles.active : ""}`}
                onClick={() => setFilter(category.id)}
              >
                <span className={styles.navIcon}>{category.icon}</span>
                {category.name}
                <span className={styles.badge}>
                  {tasks.filter((t) => t.category === category.id).length}
                </span>
              </button>
            ))}

            <div className={styles.divider} />
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Мои категории</h3>
              <button
                className={styles.addCategoryButton}
                onClick={openCreateCategoryModal}
                title="Добавить категорию"
              >
                +
              </button>
            </div>
            {categories.length === 0 ? (
              <p className={styles.emptyCategories}>
                Нет пользовательских категорий
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className={styles.customCategoryItem}>
                  <button
                    className={`${styles.navItem} ${filter === category.id ? styles.active : ""}`}
                    onClick={() => setFilter(category.id)}
                  >
                    <span className={styles.navIcon}>{category.icon}</span>
                    {category.name}
                    <span className={styles.badge}>
                      {tasks.filter((t) => t.category === category.id).length}
                    </span>
                  </button>
                  <div className={styles.categoryActions}>
                    <button
                      className={styles.categoryActionBtn}
                      onClick={() => openEditCategoryModal(category)}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.categoryActionBtn}
                      onClick={() => handleDeleteCategory(category.id)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          {userEmail && (
            <div className={styles.userInfo}>
              <span className={styles.userIcon}>👤</span>
              <span className={styles.userEmail}>
                {userEmail.toUpperCase()}
              </span>
            </div>
          )}
          <SingOutButton />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
