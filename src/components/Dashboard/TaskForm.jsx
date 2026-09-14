import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PriorityIcon, StatusIcon } from "@/lib/icons.jsx";
import { cn } from "@/lib/utils";
import DateTimePicker from "../DateTimePicker/DateTimePicker.jsx";
import {
  DEFAULT_CATEGORIES,
  COLORS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  RECURRENCE_TYPES,
} from "./constants.js";

// Общая форма задачи для создания и редактирования.
// Состояние формы (newTask) живёт в DashboardPage.
function TaskForm({
  newTask,
  setNewTask,
  categories,
  tags = [],
  onSubmit,
  onCancel,
  submitLabel,
  isLoading,
  allowToggleSubtasks = false,
  idPrefix = "task",
}) {
  const [newSubtask, setNewSubtask] = useState("");

  const set = (name, value) =>
    setNewTask((prev) => ({ ...prev, [name]: value }));
  const fid = (name) => `${idPrefix}-${name}`;

  const handleRecurringChange = (checked) => {
    setNewTask((prev) => ({
      ...prev,
      is_recurring: checked,
      ...(checked
        ? { recurrence_type: prev.recurrence_type || "daily" }
        : {
            recurrence_type: null,
            recurrence_interval: 1,
            recurrence_end_date: null,
          }),
    }));
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

  const handleToggleSubtask = (index, checked) => {
    setNewTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s, i) =>
        i === index ? { ...s, is_completed: checked } : s,
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={fid("text")}>Текст задачи</Label>
        <Textarea
          id={fid("text")}
          name="text"
          value={newTask.text}
          onChange={(e) => set("text", e.target.value)}
          placeholder="Что нужно сделать?"
          rows={3}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={fid("deadline")}>Срок выполнения</Label>
          <DateTimePicker
            id={fid("deadline")}
            value={newTask.deadline}
            onChange={(value) => set("deadline", value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fid("priority")}>Приоритет</Label>
          <Select
            value={newTask.priority}
            onValueChange={(v) => set("priority", v)}
          >
            <SelectTrigger id={fid("priority")} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TASK_PRIORITIES).map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  <PriorityIcon priority={priority.id} className="size-4" />
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={fid("category")}>Категория</Label>
          <Select
            value={newTask.category}
            onValueChange={(v) => set("category", v)}
          >
            <SelectTrigger id={fid("category")} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Встроенные</SelectLabel>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span aria-hidden="true">{cat.icon}</span> {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              {categories.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Мои категории</SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span aria-hidden="true">{cat.icon}</span> {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fid("status")}>Статус</Label>
          <Select
            value={newTask.status}
            onValueChange={(v) => set("status", v)}
          >
            <SelectTrigger id={fid("status")} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TASK_STATUSES).map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <StatusIcon status={status.id} className="size-4" />
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Повторение */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={fid("recurring")} className="cursor-pointer">
            Повторяющаяся задача
          </Label>
          <Switch
            id={fid("recurring")}
            checked={Boolean(newTask.is_recurring)}
            onCheckedChange={handleRecurringChange}
          />
        </div>
        {newTask.is_recurring && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={fid("recurrence_type")}>Повторять</Label>
              <Select
                value={newTask.recurrence_type || "daily"}
                onValueChange={(v) => set("recurrence_type", v)}
              >
                <SelectTrigger
                  id={fid("recurrence_type")}
                  className="h-9 w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RECURRENCE_TYPES).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={fid("recurrence_interval")}>Каждые</Label>
              <Input
                type="number"
                id={fid("recurrence_interval")}
                min="1"
                max="365"
                className="h-9"
                value={newTask.recurrence_interval ?? 1}
                onChange={(e) => set("recurrence_interval", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={fid("recurrence_end_date")}>Повторять до</Label>
              <Input
                type="date"
                id={fid("recurrence_end_date")}
                className="h-9"
                value={newTask.recurrence_end_date || ""}
                onChange={(e) => set("recurrence_end_date", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Подзадачи */}
      <div className="flex flex-col gap-2">
        <Label htmlFor={fid("subtask")}>Подзадачи</Label>
        <div className="flex gap-2">
          <Input
            id={fid("subtask")}
            className="h-9"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Добавить подзадачу и нажать Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleAddSubtask}
            disabled={!newSubtask.trim()}
            aria-label="Добавить подзадачу"
          >
            <Plus />
          </Button>
        </div>
        {newTask.subtasks.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1.5">
            {newTask.subtasks.map((subtask, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-md border bg-muted/40 py-1.5 pr-1.5 pl-3"
              >
                {allowToggleSubtasks ? (
                  <Checkbox
                    id={fid(`subtask-${index}`)}
                    checked={Boolean(subtask.is_completed)}
                    onCheckedChange={(checked) =>
                      handleToggleSubtask(index, checked === true)
                    }
                  />
                ) : null}
                <label
                  htmlFor={
                    allowToggleSubtasks ? fid(`subtask-${index}`) : undefined
                  }
                  className={cn(
                    "flex-1 text-sm",
                    subtask.is_completed &&
                      "text-muted-foreground line-through",
                  )}
                >
                  {subtask.text}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveSubtask(index)}
                  aria-label="Удалить подзадачу"
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Теги */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Теги</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = newTask.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected ? "text-white" : "bg-transparent text-foreground",
                  )}
                  style={{
                    borderColor: tag.color,
                    backgroundColor: selected ? tag.color : undefined,
                  }}
                >
                  {selected && (
                    <Check className="size-3.5" aria-hidden="true" />
                  )}
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Цвет */}
      <div className="flex flex-col gap-2">
        <Label>Цвет задачи</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Цвет ${color}`}
              aria-pressed={newTask.color === color}
              onClick={() => set("color", color)}
              className={cn(
                "size-8 rounded-full border-2 border-transparent transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                newTask.color === color &&
                  "scale-110 border-foreground ring-2 ring-background",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;
