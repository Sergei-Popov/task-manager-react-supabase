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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактирование категории" : "Новая категория"}
          </DialogTitle>
          <DialogDescription>
            Название и иконка, которые будут видны в списке категорий.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={isEditMode ? onUpdate : onCreate}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="categoryName">Название категории</Label>
            <Input
              id="categoryName"
              name="name"
              className="h-9"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Например, Проект"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Иконка категории</Label>
            <div
              role="radiogroup"
              aria-label="Иконка категории"
              className="grid grid-cols-6 gap-2 sm:grid-cols-8"
            >
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  role="radio"
                  aria-checked={newCategory.icon === icon}
                  aria-label={`Иконка ${icon}`}
                  onClick={() => setNewCategory((prev) => ({ ...prev, icon }))}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border text-xl transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    newCategory.icon === icon &&
                      "border-primary bg-primary/15 ring-2 ring-primary/40",
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !newCategory.name.trim()}
            >
              {isLoading ? <Spinner data-icon="inline-start" /> : null}
              {isEditMode ? "Сохранить" : "Создать категорию"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryModal;
