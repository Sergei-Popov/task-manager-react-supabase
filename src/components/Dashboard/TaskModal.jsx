import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "./TaskForm.jsx";

function TaskModal({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  categories,
  tags = [],
  onSubmit,
  isLoading,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
          <DialogDescription>
            Заполните описание, срок и, при необходимости, подзадачи и теги.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          idPrefix="new"
          newTask={newTask}
          setNewTask={setNewTask}
          categories={categories}
          tags={tags}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Создать задачу"
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

export default TaskModal;
