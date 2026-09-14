import { useState, useEffect } from "react";
import api from "../../utils/api.js";
import { toast } from "sonner";
import {
  CalendarDays,
  Columns3,
  Inbox,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";
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
  const [confirm, setConfirm] = useState(null); // диалог подтверждения
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
    api.auth
      .me()
      .then((user) => setUserEmail(user?.email || ""))
      .catch((error) => console.error("Ошибка загрузки профиля:", error));
  }, []);

  const fetchCategories = async () => {
    try {
      setCategories(await api.categories.list());
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const fetchTags = async () => {
    try {
      setTags(await api.tags.list());
    } catch (error) {
      console.error("Ошибка загрузки тегов:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      // Задачи приходят вместе с подзадачами и связями с тегами
      setTasks(await api.tasks.list());
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Приводит состояние формы к телу запроса API
  const buildTaskPayload = () => ({
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
      ? Number(newTask.recurrence_interval) || 1
      : null,
    recurrence_end_date: newTask.is_recurring
      ? newTask.recurrence_end_date || null
      : null,
    subtasks: newTask.subtasks.map((subtask) => ({
      text: subtask.text,
      is_completed: subtask.is_completed || false,
    })),
    tags: newTask.tags,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.text.trim() || !newTask.deadline) return;

    setIsLoading(true);

    try {
      const createdTask = await api.tasks.create(buildTaskPayload());

      setTasks((prev) =>
        [...prev, createdTask].sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline),
        ),
      );
      setNewTask(INITIAL_TASK_STATE);
      setIsModalOpen(false);
      toast.success("Задача создана");
    } catch (error) {
      console.error("Ошибка создания задачи:", error);
      toast.error(error.message || "Не удалось создать задачу");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const updatedTask = await api.tasks.update(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      toast.error(error.message || "Не удалось обновить статус");
    }
  };

  const deleteTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    setConfirm({
      open: true,
      title: "Удалить задачу?",
      description: task
        ? `«${truncateText(task.text, 80)}» будет удалена без возможности восстановления.`
        : "",
      confirmLabel: "Удалить",
      destructive: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.tasks.remove(id);
          setTasks((prev) => prev.filter((t) => t.id !== id));
          if (selectedTask?.id === id) closeViewModal();
          toast.success("Задача удалена");
        } catch (error) {
          console.error("Ошибка удаления задачи:", error);
          toast.error(error.message || "Не удалось удалить задачу");
        }
      },
    });
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
      const updatedTask = await api.tasks.update(
        selectedTask.id,
        buildTaskPayload(),
      );

      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id ? updatedTask : task)),
      );

      closeViewModal();
      toast.success("Изменения сохранены");
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
      toast.error(error.message || "Не удалось сохранить задачу");
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
      const category = await api.categories.create({
        name: newCategory.name.trim(),
        icon: newCategory.icon,
      });
      setCategories((prev) => [...prev, category]);
      closeCategoryModal();
      toast.success("Категория создана");
    } catch (error) {
      console.error("Ошибка создания категории:", error);
      toast.error(error.message || "Не удалось создать категорию");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !selectedCategory) return;

    try {
      const category = await api.categories.update(selectedCategory.id, {
        name: newCategory.name.trim(),
        icon: newCategory.icon,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? category : cat)),
      );
      closeCategoryModal();
      toast.success("Категория обновлена");
    } catch (error) {
      console.error("Ошибка обновления категории:", error);
      toast.error(error.message || "Не удалось обновить категорию");
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    setConfirm({
      open: true,
      title: `Удалить категорию «${category?.name || ""}»?`,
      description:
        "Задачи с этой категорией останутся, но будут отображаться без категории.",
      confirmLabel: "Удалить",
      destructive: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.categories.remove(categoryId);
          setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
          if (filter === categoryId) {
            setFilter("all");
          }
          toast.success("Категория удалена");
        } catch (error) {
          console.error("Ошибка удаления категории:", error);
          toast.error(error.message || "Не удалось удалить категорию");
        }
      },
    });
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
      const tag = await api.tags.create({ name, color });
      setTags((prev) => [...prev, tag]);
      toast.success("Тег создан");
    } catch (error) {
      console.error("Ошибка создания тега:", error);
      toast.error(error.message || "Не удалось создать тег");
    }
  };

  const handleUpdateTag = async (tagId, name, color) => {
    try {
      const tag = await api.tags.update(tagId, { name, color });
      setTags((prev) => prev.map((t) => (t.id === tagId ? tag : t)));
      toast.success("Тег обновлён");
    } catch (error) {
      console.error("Ошибка обновления тега:", error);
      toast.error(error.message || "Не удалось обновить тег");
    }
  };

  const handleDeleteTag = (tagId) => {
    const tag = tags.find((t) => t.id === tagId);
    setConfirm({
      open: true,
      title: `Удалить тег «${tag?.name || ""}»?`,
      description: "Тег будет снят со всех задач.",
      confirmLabel: "Удалить",
      destructive: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.tags.remove(tagId);
          setTags((prev) => prev.filter((t) => t.id !== tagId));
          setTasks((prev) =>
            prev.map((task) => ({
              ...task,
              task_tags: (task.task_tags || []).filter(
                (tt) => tt.tag_id !== tagId,
              ),
            })),
          );
          toast.success("Тег удалён");
        } catch (error) {
          console.error("Ошибка удаления тега:", error);
          toast.error(error.message || "Не удалось удалить тег");
        }
      },
    });
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

  const VIEWS = [
    { id: "list", label: "Список", icon: LayoutList },
    { id: "kanban", label: "Канбан", icon: Columns3 },
    { id: "calendar", label: "Календарь", icon: CalendarDays },
  ];

  const todayLabel = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SidebarProvider>
      <Sidebar
        tasks={tasks}
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        userEmail={userEmail}
        openCreateCategoryModal={openCreateCategoryModal}
        openEditCategoryModal={openEditCategoryModal}
        handleDeleteCategory={handleDeleteCategory}
        openTagModal={() => setIsTagModalOpen(true)}
        stats={stats}
      />

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">Мои задачи</h1>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {todayLabel}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchTasks}
                  disabled={isLoading}
                  aria-label="Обновить задачи"
                >
                  <RefreshCw
                    className={isLoading ? "animate-spin" : undefined}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Обновить</TooltipContent>
            </Tooltip>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus data-icon="inline-start" />
              <span className="hidden sm:inline">Новая задача</span>
              <span className="sm:hidden">Задача</span>
            </Button>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto sm:flex-1 sm:justify-end lg:order-none">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск задач…"
                aria-label="Поиск задач"
                className="pl-8"
              />
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value)}
              aria-label="Режим просмотра"
            >
              {VIEWS.map(({ id, label, icon }) => {
                const Icon = icon;
                return (
                  <Tooltip key={id}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value={id} aria-label={label}>
                        <Icon />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <StatsGrid stats={stats} />

          {viewMode === "list" && (
            <section aria-label="Список задач" className="flex flex-col gap-3">
              {isLoading && tasks.length === 0 ? (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              ) : filteredTasks.length === 0 ? (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Inbox />
                    </EmptyMedia>
                    <EmptyTitle>
                      {tasks.length === 0
                        ? "Задач пока нет"
                        : "Ничего не найдено"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {tasks.length === 0
                        ? "Создайте первую задачу, чтобы начать планировать."
                        : "Попробуйте изменить фильтр или поисковый запрос."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {tasks.length === 0 && (
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus data-icon="inline-start" />
                      Новая задача
                    </Button>
                  )}
                </Empty>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={getCategoryInfo(task.category)}
                    timeRemaining={getTimeRemaining(task.deadline)}
                    onStatusChange={updateTaskStatus}
                    onView={openTaskView}
                    onEdit={openEditMode}
                    onDelete={deleteTask}
                    truncateText={truncateText}
                    tags={tags}
                  />
                ))
              )}
            </section>
          )}

          {viewMode === "kanban" && (
            <KanbanBoard
              tasks={filteredTasks}
              isLoading={isLoading && tasks.length === 0}
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

          {viewMode === "calendar" && (
            <CalendarView tasks={filteredTasks} onView={openTaskView} />
          )}
        </div>
      </SidebarInset>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewTask(INITIAL_TASK_STATE);
        }}
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

      <ConfirmDialog
        state={confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
      />
    </SidebarProvider>
  );
}

export default DashboardPage;
