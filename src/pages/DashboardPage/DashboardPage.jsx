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
  TagModal,
  KanbanBoard,
  CalendarView,
  DEFAULT_CATEGORIES,
  INITIAL_TASK_STATE,
  INITIAL_CATEGORY_STATE,
} from "../../components/Dashboard";

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" или "kanban"
  const [searchQuery, setSearchQuery] = useState("");
  const [newTask, setNewTask] = useState(INITIAL_TASK_STATE);
  const [newCategory, setNewCategory] = useState(INITIAL_CATEGORY_STATE);

  // Загрузка задач, категорий и тегов при монтировании
  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchTags();
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

  const fetchTags = async () => {
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки тегов:", error);
        return;
      }

      setTags(data || []);
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

      // Загружаем задачи с подзадачами и тегами
      const { data, error } = await supabaseClient
        .from("tasks")
        .select(
          `
          *,
          subtasks (id, text, is_completed, position),
          task_tags (tag_id)
        `,
        )
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

      // Создаём задачу
      const { data: taskData, error: taskError } = await supabaseClient
        .from("tasks")
        .insert({
          user_id: user.id,
          text: newTask.text.trim(),
          deadline: newTask.deadline,
          category: newTask.category,
          color: newTask.color,
          status: newTask.status,
          priority: newTask.priority,
          is_recurring: newTask.is_recurring,
          recurrence_type: newTask.is_recurring
            ? newTask.recurrence_type || "daily"
            : null,
          recurrence_interval: newTask.is_recurring
            ? newTask.recurrence_interval
            : null,
          recurrence_end_date: newTask.is_recurring
            ? newTask.recurrence_end_date
            : null,
        })
        .select()
        .single();

      if (taskError) {
        console.error("Ошибка создания задачи:", taskError);
        return;
      }

      // Создаём подзадачи
      if (newTask.subtasks.length > 0) {
        const subtasksToInsert = newTask.subtasks.map((subtask, index) => ({
          task_id: taskData.id,
          text: subtask.text,
          is_completed: subtask.is_completed,
          position: index,
        }));

        const { error: subtasksError } = await supabaseClient
          .from("subtasks")
          .insert(subtasksToInsert);

        if (subtasksError) {
          console.error("Ошибка создания подзадач:", subtasksError);
        }
      }

      // Создаём связи с тегами
      if (newTask.tags.length > 0) {
        const taskTagsToInsert = newTask.tags.map((tagId) => ({
          task_id: taskData.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabaseClient
          .from("task_tags")
          .insert(taskTagsToInsert);

        if (tagsError) {
          console.error("Ошибка привязки тегов:", tagsError);
        }
      }

      // Обновляем список задач
      const enrichedTask = {
        ...taskData,
        subtasks: newTask.subtasks.map((s, i) => ({ ...s, position: i })),
        task_tags: newTask.tags.map((tagId) => ({ tag_id: tagId })),
      };

      setTasks((prev) =>
        [...prev, enrichedTask].sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline),
        ),
      );
      setNewTask(INITIAL_TASK_STATE);
      setIsLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка:", error);
      setIsLoading(false);
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
      priority: task.priority || "medium",
      is_recurring: task.is_recurring || false,
      recurrence_type: task.recurrence_type,
      recurrence_interval: task.recurrence_interval || 1,
      recurrence_end_date: task.recurrence_end_date,
      subtasks: task.subtasks || [],
      tags: task.task_tags?.map((tt) => tt.tag_id) || [],
    });
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!newTask.text.trim() || !newTask.deadline) return;

    setIsLoading(true);

    try {
      // Обновляем основные данные задачи
      const { data, error } = await supabaseClient
        .from("tasks")
        .update({
          text: newTask.text.trim(),
          deadline: newTask.deadline,
          category: newTask.category,
          color: newTask.color,
          status: newTask.status,
          priority: newTask.priority,
          is_recurring: newTask.is_recurring,
          recurrence_type: newTask.is_recurring
            ? newTask.recurrence_type
            : null,
          recurrence_interval: newTask.is_recurring
            ? newTask.recurrence_interval
            : null,
          recurrence_end_date: newTask.is_recurring
            ? newTask.recurrence_end_date
            : null,
        })
        .eq("id", selectedTask.id)
        .select()
        .single();

      if (error) {
        console.error("Ошибка обновления задачи:", error);
        return;
      }

      // Обновляем подзадачи: удаляем старые, добавляем новые
      await supabaseClient
        .from("subtasks")
        .delete()
        .eq("task_id", selectedTask.id);

      if (newTask.subtasks.length > 0) {
        const subtasksToInsert = newTask.subtasks.map((subtask, index) => ({
          task_id: selectedTask.id,
          text: subtask.text,
          is_completed: subtask.is_completed || false,
          position: index,
        }));

        await supabaseClient.from("subtasks").insert(subtasksToInsert);
      }

      // Обновляем теги: удаляем старые связи, добавляем новые
      await supabaseClient
        .from("task_tags")
        .delete()
        .eq("task_id", selectedTask.id);

      if (newTask.tags.length > 0) {
        const taskTagsToInsert = newTask.tags.map((tagId) => ({
          task_id: selectedTask.id,
          tag_id: tagId,
        }));

        await supabaseClient.from("task_tags").insert(taskTagsToInsert);
      }

      // Обновляем локальное состояние
      const updatedTask = {
        ...data,
        subtasks: newTask.subtasks.map((s, i) => ({ ...s, position: i })),
        task_tags: newTask.tags.map((tagId) => ({ tag_id: tagId })),
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id ? updatedTask : task)),
      );

      closeViewModal();
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
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
      // Фильтр по поисковому запросу
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!task.text.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Фильтр по статусу/категории
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

  // Функции для работы с тегами
  const handleCreateTag = async (name, color) => {
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("tags")
        .insert({
          user_id: user.id,
          name: name,
          color: color,
        })
        .select()
        .single();

      if (error) {
        console.error("Ошибка создания тега:", error);
        return;
      }

      setTags((prev) => [...prev, data]);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleUpdateTag = async (tagId, name, color) => {
    try {
      const { data, error } = await supabaseClient
        .from("tags")
        .update({ name, color })
        .eq("id", tagId)
        .select()
        .single();

      if (error) {
        console.error("Ошибка обновления тега:", error);
        return;
      }

      setTags((prev) => prev.map((tag) => (tag.id === tagId ? data : tag)));
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Удалить этот тег?")) return;

    try {
      const { error } = await supabaseClient
        .from("tags")
        .delete()
        .eq("id", tagId);

      if (error) {
        console.error("Ошибка удаления тега:", error);
        return;
      }

      setTags((prev) => prev.filter((tag) => tag.id !== tagId));
    } catch (error) {
      console.error("Ошибка:", error);
    }
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

      {/* Mobile Refresh Button */}
      <button
        className={styles.mobileRefreshButton}
        onClick={fetchTasks}
        disabled={isLoading}
        title="Обновить задачи"
      >
        {isLoading ? "⏳" : "🔄"}
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
        openTagModal={() => setIsTagModalOpen(true)}
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
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
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
              <button
                className={`${styles.viewToggleBtn} ${viewMode === "calendar" ? styles.active : ""}`}
                onClick={() => setViewMode("calendar")}
                title="Календарь"
              >
                📅
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
                    tags={tags}
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
            tags={tags}
          />
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <CalendarView
            tasks={tasks}
            onView={openTaskView}
            onEdit={openEditMode}
            onStatusChange={updateTaskStatus}
            tags={tags}
          />
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        categories={categories}
        tags={tags}
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
        tags={tags}
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

      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tags}
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DashboardPage;
