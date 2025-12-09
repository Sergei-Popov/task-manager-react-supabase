import { useState, useEffect } from "react";
import styles from "./DashboardPage.module.css";
import SingOutButton from "../../components/SingOutButton/SingOutButton.jsx";
import DateTimePicker from "../../components/DateTimePicker/DateTimePicker.jsx";
import supabaseClient from "../../utils/supabaseClient.js";

const DEFAULT_CATEGORIES = [
  { id: "work", name: "Работа", icon: "💼" },
  { id: "personal", name: "Личное", icon: "🏠" },
  { id: "study", name: "Учёба", icon: "📚" },
  { id: "health", name: "Здоровье", icon: "💪" },
  { id: "shopping", name: "Покупки", icon: "🛒" },
];

const AVAILABLE_ICONS = [
  "💼",
  "🏠",
  "📚",
  "💪",
  "🛒",
  "🎯",
  "🎨",
  "🎮",
  "🎵",
  "🎬",
  "✈️",
  "🚗",
  "💰",
  "📱",
  "💻",
  "📧",
  "📞",
  "🍽️",
  "🏃",
  "🎁",
  "❤️",
  "⭐",
  "🔥",
  "💡",
  "🎉",
  "📝",
  "🔔",
  "🌟",
  "🚀",
  "🏆",
];

const COLORS = [
  "#6366f1", // Индиго
  "#8b5cf6", // Фиолетовый
  "#ec4899", // Розовый
  "#ef4444", // Красный
  "#f97316", // Оранжевый
  "#eab308", // Жёлтый
  "#22c55e", // Зелёный
  "#14b8a6", // Бирюзовый
  "#3b82f6", // Синий
  "#64748b", // Серый
];

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [newTask, setNewTask] = useState({
    text: "",
    deadline: "",
    category: "work",
    color: "#6366f1",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "🎯",
  });

  // Загрузка задач и категорий при монтировании
  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки категорий:", error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        console.error("Пользователь не авторизован");
        return;
      }

      // Сохраняем email пользователя
      setUserEmail(user.email || "");

      const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("deadline", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки задач:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setNewTask((prev) => ({ ...prev, color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.text.trim() || !newTask.deadline) return;

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        console.error("Пользователь не авторизован");
        return;
      }

      const { data, error } = await supabaseClient
        .from("tasks")
        .insert({
          user_id: user.id,
          text: newTask.text.trim(),
          deadline: newTask.deadline,
          category: newTask.category,
          color: newTask.color,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Ошибка создания задачи:", error);
        return;
      }

      setTasks((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline),
        ),
      );
      setNewTask({
        text: "",
        deadline: "",
        category: "work",
        color: "#6366f1",
      });
      setIsLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabaseClient
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id);

      if (error) {
        console.error("Ошибка обновления статуса:", error);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Ошибка удаления задачи:", error);
        return;
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const openTaskView = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
    setIsEditMode(false);
  };

  const openEditMode = (task) => {
    setSelectedTask(task);
    setNewTask({
      text: task.text,
      deadline: task.deadline,
      category: task.category,
      color: task.color,
    });
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!newTask.text.trim() || !newTask.deadline) return;

    try {
      const { data, error } = await supabaseClient
        .from("tasks")
        .update({
          text: newTask.text.trim(),
          deadline: newTask.deadline,
          category: newTask.category,
          color: newTask.color,
        })
        .eq("id", selectedTask.id)
        .select()
        .single();

      if (error) {
        console.error("Ошибка обновления задачи:", error);
        return;
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id ? data : task)),
      );

      closeViewModal();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setIsEditMode(false);
    setSelectedTask(null);
    setNewTask({
      text: "",
      deadline: "",
      category: "work",
      color: "#6366f1",
    });
  };

  const truncateText = (text, maxLength = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return task.category === filter;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff < 0) return { text: "Просрочено", isOverdue: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days} дн. ${hours} ч.`, isOverdue: false };
    if (hours > 0)
      return { text: `${hours} ч. ${minutes} мин.`, isOverdue: false };
    return { text: `${minutes} мин.`, isOverdue: false };
  };

  // Функции для работы с категориями
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryIconSelect = (icon) => {
    setNewCategory((prev) => ({ ...prev, icon }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("categories")
        .insert({
          user_id: user.id,
          name: newCategory.name.trim(),
          icon: newCategory.icon,
        })
        .select()
        .single();

      if (error) {
        console.error("Ошибка создания категории:", error);
        return;
      }

      setCategories((prev) => [...prev, data]);
      closeCategoryModal();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !selectedCategory) return;

    try {
      const { data, error } = await supabaseClient
        .from("categories")
        .update({
          name: newCategory.name.trim(),
          icon: newCategory.icon,
        })
        .eq("id", selectedCategory.id)
        .select()
        .single();

      if (error) {
        console.error("Ошибка обновления категории:", error);
        return;
      }

      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? data : cat)),
      );
      closeCategoryModal();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Удалить эту категорию? Задачи с этой категорией останутся, но будут отображаться без категории.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("Ошибка удаления категории:", error);
        return;
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));

      // Сбрасываем фильтр, если была выбрана удаляемая категория
      if (filter === categoryId) {
        setFilter("all");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const openCreateCategoryModal = () => {
    setNewCategory({ name: "", icon: "🎯" });
    setSelectedCategory(null);
    setIsEditCategoryMode(false);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setNewCategory({ name: category.name, icon: category.icon });
    setIsEditCategoryMode(true);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setIsEditCategoryMode(false);
    setSelectedCategory(null);
    setNewCategory({ name: "", icon: "🎯" });
  };

  const getCategoryInfo = (categoryId) => {
    // Сначала ищем в пользовательских категориях
    const userCategory = categories.find((c) => c.id === categoryId);
    if (userCategory) return userCategory;

    // Затем в дефолтных
    const defaultCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
    if (defaultCategory) return defaultCategory;

    return DEFAULT_CATEGORIES[0];
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    overdue: tasks.filter(
      (t) => !t.completed && new Date(t.deadline) < new Date(),
    ).length,
  };

  return (
    <div className={styles.dashboard}>
      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsSidebarOpen(true)}
      >
        ☰
      </button>

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
            className={`${styles.navItem} ${filter === "active" ? styles.active : ""}`}
            onClick={() => setFilter("active")}
          >
            <span className={styles.navIcon}>⏳</span>
            Активные
            <span className={styles.badge}>{stats.active}</span>
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

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Мои задачи</h1>
            <p className={styles.subtitle}>
              {new Date().toLocaleDateString("ru-RU", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            <span>+</span> Новая задача
          </button>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#6366f1" }}>
              📊
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Всего задач</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#22c55e" }}>
              ✅
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.completed}</span>
              <span className={styles.statLabel}>Завершено</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#f97316" }}>
              ⏳
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>В работе</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ef4444" }}>
              ⚠️
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.overdue}</span>
              <span className={styles.statLabel}>Просрочено</span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className={styles.tasksList}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⏳</span>
              <h3>Загрузка задач...</h3>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📝</span>
              <h3>Нет задач</h3>
              <p>Создайте новую задачу, чтобы начать</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const timeRemaining = getTimeRemaining(task.deadline);
              const category = getCategoryInfo(task.category);
              return (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${task.completed ? styles.completed : ""}`}
                  style={{ borderLeftColor: task.color }}
                >
                  <button
                    className={`${styles.checkbox} ${task.completed ? styles.checked : ""}`}
                    onClick={() => toggleTask(task.id)}
                    style={{
                      borderColor: task.color,
                      backgroundColor: task.completed
                        ? task.color
                        : "transparent",
                    }}
                  >
                    {task.completed && "✓"}
                  </button>
                  <div
                    className={styles.taskContent}
                    onClick={() => openTaskView(task)}
                  >
                    <h4 className={styles.taskText}>
                      {truncateText(task.text)}
                    </h4>
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
                        📅 {new Date(task.deadline).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditMode(task)}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Новая задача</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <form onSubmit={handleSubmit} className={styles.form}>
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
                    onClick={() => setIsModalOpen(false)}
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
      )}

      {/* View/Edit Task Modal */}
      {isViewModalOpen && selectedTask && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {isEditMode ? "Редактирование задачи" : "Просмотр задачи"}
              </h2>
              <button className={styles.closeButton} onClick={closeViewModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              {isEditMode ? (
                <form onSubmit={handleUpdateTask} className={styles.form}>
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
                      onClick={closeViewModal}
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
                        backgroundColor: selectedTask.completed
                          ? "#22c55e"
                          : "#f97316",
                      }}
                    >
                      {selectedTask.completed ? "Завершено" : "В работе"}
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
                        {new Date(selectedTask.deadline).toLocaleString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
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
                        {new Date(selectedTask.created_at).toLocaleString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeViewModal}
                    >
                      Закрыть
                    </button>
                    <button
                      type="button"
                      className={styles.submitButton}
                      onClick={() => openEditMode(selectedTask)}
                    >
                      ✏️ Редактировать
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className={styles.modalOverlay} onClick={closeCategoryModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {isEditCategoryMode
                  ? "Редактирование категории"
                  : "Новая категория"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={closeCategoryModal}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <form
                onSubmit={
                  isEditCategoryMode
                    ? handleUpdateCategory
                    : handleCreateCategory
                }
                className={styles.form}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="categoryName">Название категории</label>
                  <input
                    id="categoryName"
                    name="name"
                    value={newCategory.name}
                    onChange={handleCategoryInputChange}
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
                        onClick={() => handleCategoryIconSelect(icon)}
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
                    onClick={closeCategoryModal}
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
                      : isEditCategoryMode
                        ? "Сохранить изменения"
                        : "Создать категорию"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
