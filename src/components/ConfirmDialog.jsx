import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

// Универсальный диалог подтверждения вместо window.confirm.
// state: { open, title, description, confirmLabel, destructive, onConfirm }
function ConfirmDialog({ state, onOpenChange }) {
  const {
    open = false,
    title = "Вы уверены?",
    description = "",
    confirmLabel = "Подтвердить",
    destructive = false,
    onConfirm,
  } = state || {};

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? buttonVariants({ variant: "destructive" })
                : undefined
            }
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
