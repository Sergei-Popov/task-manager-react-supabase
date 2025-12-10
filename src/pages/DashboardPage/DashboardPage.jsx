import { useState, useEffect } from "react";
import styles from "./DashboardPage.module.css";
import supabaseClient from "../../utils/supabaseClient.js";
import {
  Sidebar,
  StatsGrid,
  TaskCard,
  TaskModal,
  TaskViewModal,
  CategoryModal,
  KanbanBoard,
  DEFAULT_CATEGORIES,
  INITIAL_TASK_STATE,
  INITIAL_CATEGORY_STATE,
} from "../../components/Dashboard";

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
  const [viewMode, setViewMode] = useState("list"); // "list" или "kanban"
  const [newTask, setNewTask] = useState(INITIAL_TASK_STATE);
  const [newCategory, setNewCategory] = useState(INITIAL_CATEGORY_STATE);

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
          status: newTask.status,
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
      setNewTask(INITIAL_TASK_STATE);
      setIsLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const { error } = await supabaseClient
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Ошибка обновления статуса:", error);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
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
      status: task.status,
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
          status: newTask.status,
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
    setNewTask(INITIAL_TASK_STATE);
  };

  const truncateText = (text, maxLength = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "active") return task.status !== "done";
      if (filter === "completed") return task.status === "done";
      if (filter === "in_progress") return task.status === "in_progress";
      if (filter === "todo") return task.status === "todo";
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

      if (filter === categoryId) {
        setFilter("all");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const openCreateCategoryModal = () => {
    setNewCategory(INITIAL_CATEGORY_STATE);
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
    setNewCategory(INITIAL_CATEGORY_STATE);
  };

  const getCategoryInfo = (categoryId) => {
    const userCategory = categories.find((c) => c.id === categoryId);
    if (userCategory) return userCategory;

    const defaultCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
    if (defaultCategory) return defaultCategory;

    return DEFAULT_CATEGORIES[0];
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(
      (t) => t.status !== "done" && new Date(t.deadline) < new Date(),
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

      <Sidebar
        tasks={tasks}
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userEmail={userEmail}
        openCreateCategoryModal={openCreateCategoryModal}
        openEditCategoryModal={openEditCategoryModal}
        handleDeleteCategory={handleDeleteCategory}
        stats={stats}
      />

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
          <div className={styles.headerActions}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.active : ""}`}
                onClick={() => setViewMode("list")}
                title="Список"
              >
                ☰
              </button>
              <button
                className={`${styles.viewToggleBtn} ${viewMode === "kanban" ? styles.active : ""}`}
                onClick={() => setViewMode("kanban")}
                title="Канбан"
              >
                ▦
              </button>
            </div>
            <button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              <span>+</span> Новая задача
            </button>
          </div>
        </header>

        <StatsGrid stats={stats} />

        {/* Tasks List View */}
        {viewMode === "list" && (
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
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={category}
                    timeRemaining={timeRemaining}
                    onStatusChange={updateTaskStatus}
                    onView={openTaskView}
                    onEdit={openEditMode}
                    onDelete={deleteTask}
                    truncateText={truncateText}
                  />
                );
              })
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <KanbanBoard
            tasks={filteredTasks}
            isLoading={isLoading}
            onStatusChange={updateTaskStatus}
            onView={openTaskView}
            onEdit={openEditMode}
            onDelete={deleteTask}
            getCategoryInfo={getCategoryInfo}
            getTimeRemaining={getTimeRemaining}
            truncateText={truncateText}
          />
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <TaskViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        selectedTask={selectedTask}
        isEditMode={isEditMode}
        newTask={newTask}
        setNewTask={setNewTask}
        categories={categories}
        onUpdate={handleUpdateTask}
        onEdit={openEditMode}
        isLoading={isLoading}
        getCategoryInfo={getCategoryInfo}
        getTimeRemaining={getTimeRemaining}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        isEditMode={isEditCategoryMode}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DashboardPage;
