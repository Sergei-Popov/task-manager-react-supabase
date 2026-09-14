import {
  CheckCircle2,
  Clock,
  LayoutList,
  ListTodo,
  Pencil,
  Plus,
  Tags,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SingOutButton from "../SingOutButton/SingOutButton.jsx";
import { DEFAULT_CATEGORIES } from "./constants.js";

const STATUS_FILTERS = [
  { id: "all", name: "Все задачи", icon: LayoutList, key: "total" },
  { id: "todo", name: "К выполнению", icon: ListTodo, key: "todo" },
  { id: "in_progress", name: "В работе", icon: Clock, key: "inProgress" },
  {
    id: "completed",
    name: "Завершённые",
    icon: CheckCircle2,
    key: "completed",
  },
];

function Sidebar({
  tasks,
  categories,
  filter,
  setFilter,
  userEmail,
  openCreateCategoryModal,
  openEditCategoryModal,
  handleDeleteCategory,
  openTagModal,
  stats,
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const choose = (id) => {
    setFilter(id);
    if (isMobile) setOpenMobile(false);
  };

  const countFor = (categoryId) =>
    tasks.filter((t) => t.category === categoryId).length;

  return (
    <SidebarRoot collapsible="offcanvas">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">Мои задачи</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Статус</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {STATUS_FILTERS.map(({ id, name, icon, key }) => {
                const Icon = icon;
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={filter === id}
                      onClick={() => choose(id)}
                    >
                      <Icon />
                      <span>{name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{stats[key]}</SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Категории</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DEFAULT_CATEGORIES.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    isActive={filter === category.id}
                    onClick={() => choose(category.id)}
                  >
                    <span
                      className="w-4 text-center leading-none"
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{countFor(category.id)}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Мои категории</SidebarGroupLabel>
          <SidebarGroupAction
            title="Добавить категорию"
            onClick={openCreateCategoryModal}
          >
            <Plus />
            <span className="sr-only">Добавить категорию</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            {categories.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Пока нет своих категорий
              </p>
            ) : (
              <SidebarMenu>
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id} className="group/cat">
                    <SidebarMenuButton
                      isActive={filter === category.id}
                      onClick={() => choose(category.id)}
                      className="pr-16"
                    >
                      <span
                        className="w-4 text-center leading-none"
                        aria-hidden="true"
                      >
                        {category.icon}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </SidebarMenuButton>
                    <span className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuAction
                            className="static translate-y-0"
                            onClick={() => openEditCategoryModal(category)}
                          >
                            <Pencil />
                            <span className="sr-only">Редактировать</span>
                          </SidebarMenuAction>
                        </TooltipTrigger>
                        <TooltipContent>Редактировать</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuAction
                            className="static translate-y-0 hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 />
                            <span className="sr-only">Удалить</span>
                          </SidebarMenuAction>
                        </TooltipTrigger>
                        <TooltipContent>Удалить</TooltipContent>
                      </Tooltip>
                    </span>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={openTagModal}>
                  <Tags />
                  <span>Управление тегами</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        {userEmail && (
          <div className="flex items-center gap-2 rounded-lg border bg-sidebar-accent/40 px-3 py-2 text-sm">
            <UserRound
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="truncate" title={userEmail}>
              {userEmail}
            </span>
          </div>
        )}
        <SingOutButton className="w-full" />
      </SidebarFooter>
    </SidebarRoot>
  );
}

export default Sidebar;
