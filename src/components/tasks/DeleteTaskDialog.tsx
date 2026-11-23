import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/hooks/useQueries";
import type { Task } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteTaskDialogProps {
  task: Task | null;
  onClose: () => void;
}

export function DeleteTaskDialog({ task, onClose }: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  const confirm = () => {
    if (!task) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("任务已删除", { description: task.title });
        onClose();
      },
      onError: (err) =>
        toast.error("删除失败", { description: err.message || "请稍后重试" }),
    });
  };

  return (
    <AlertDialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        data-ocid="tasks.delete.dialog"
        className="rounded-2xl border-border bg-popover shadow-float sm:max-w-sm"
      >
        <AlertDialogHeader>
          <span
            className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl pill-date-overdue max-sm:mx-auto"
            aria-hidden
          >
            <Trash2 className="h-5 w-5" />
          </span>
          <AlertDialogTitle className="font-display text-xl font-semibold">
            删除这个任务？
          </AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            「{task?.title}」将被永久删除，此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            data-ocid="tasks.delete.cancel_button"
            className="rounded-full transition-smooth active:scale-95"
          >
            取消
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            data-ocid="tasks.delete.confirm_button"
            disabled={deleteTask.isPending}
            onClick={confirm}
            className="rounded-lg px-5 font-semibold transition-smooth hover:-translate-y-px hover:shadow-subtle active:translate-y-0 active:scale-95"
          >
            {deleteTask.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            确认删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
