import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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

  const reset = () => {
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor(COLORS[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    if (editingTag) {
      onUpdateTag(editingTag.id, newTagName.trim(), newTagColor);
    } else {
      onCreateTag(newTagName.trim(), newTagColor);
    }
    reset();
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление тегами</DialogTitle>
          <DialogDescription>
            Теги можно вешать на задачи в любом количестве.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tagName">
              {editingTag ? "Редактировать тег" : "Новый тег"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="tagName"
                className="h-9"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Название тега"
                maxLength={50}
                required
              />
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !newTagName.trim()}
                aria-label={editingTag ? "Сохранить тег" : "Добавить тег"}
              >
                {editingTag ? <Check /> : <Plus />}
              </Button>
              {editingTag && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={reset}
                  aria-label="Отменить редактирование"
                >
                  <X />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Цвет тега</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Цвет ${color}`}
                  aria-pressed={newTagColor === color}
                  onClick={() => setNewTagColor(color)}
                  className={cn(
                    "size-8 rounded-full border-2 border-transparent transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    newTagColor === color &&
                      "scale-110 border-foreground ring-2 ring-background",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>

        <Separator />

        <div>
          <h4 className="mb-2 text-sm font-semibold">Существующие теги</h4>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Теги ещё не созданы</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center justify-between gap-3 rounded-md border py-1.5 pr-1.5 pl-3"
                >
                  <Badge
                    className="border-transparent text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(tag)}
                        >
                          <Pencil />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Редактировать</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="hover:text-destructive"
                          onClick={() => onDeleteTag(tag.id)}
                        >
                          <Trash2 />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Удалить</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Готово
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TagModal;
