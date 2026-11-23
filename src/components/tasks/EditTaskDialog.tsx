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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTask } from "@/hooks/useQueries";
import {
  type Priority,
  TASK_NOTE_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  type Task,
} from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DateField } from "./DateField";
import { PrioritySelect } from "./PrioritySelect";

interface EditTaskDialogProps {
  task: Task | null;
  today: string;
  onClose: () => void;
  onRequestDelete: (task: Task) => void;
}

export function EditTaskDialog({
  task,
  today,
  onClose,
  onRequestDelete,
}: EditTaskDialogProps) {
  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="tasks.edit.dialog"
        className="rounded-2xl border-border bg-popover shadow-float sm:max-w-md"
      >
        {task && (
          <EditForm
            key={task.id.toString()}
            task={task}
            today={today}
            onClose={onClose}
            onRequestDelete={onRequestDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  task,
  today,
  onClose,
  onRequestDelete,
}: EditTaskDialogProps & { task: Task }) {
  const updateTask = useUpdateTask();
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [date, setDate] = useState<string | null>(task.date ?? null);
  const [note, setNote] = useState(task.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (updateTask.isPending) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError("任务标题不能为空");
      return;
    }
    setError(null);
    updateTask.mutate(
      {
        id: task.id,
        title: trimmed,
        priority,
        date,
        note: note.trim() ? note.trim() : null,
      },
      {
        onSuccess: () => {
          toast.success("已保存修改");
          onClose();
        },
        onError: (err) => {
          const message = err.message || "保存失败，请重试";
          setError(message);
          toast.error("保存失败", { description: message });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DialogHeader>
        <DialogTitle className="font-display text-xl font-semibold">
          编辑任务
        </DialogTitle>
        <DialogDescription>
          调整标题、优先级、日期，或补充一句备注。
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="edit-title">标题</Label>
        <Input
          id="edit-title"
          data-ocid="tasks.edit.input"
          value={title}
          maxLength={TASK_TITLE_MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 rounded-xl border-input bg-background text-[15px] transition-smooth focus-visible:shadow-glow focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wider text-muted-foreground">
            优先级
          </p>
          <PrioritySelect
            value={priority}
            onChange={setPriority}
            ocid="tasks.edit.priority"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wider text-muted-foreground">
            日期
          </p>
          <DateField
            value={date}
            onChange={setDate}
            today={today}
            ocid="tasks.edit.date"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="edit-note">备注（可选）</Label>
          <span className="tabular text-xs text-muted-foreground">
            {note.length}/{TASK_NOTE_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="edit-note"
          data-ocid="tasks.edit.textarea"
          value={note}
          maxLength={TASK_NOTE_MAX_LENGTH}
          rows={3}
          placeholder="例如：需要先确认会议室"
          onChange={(e) => setNote(e.target.value)}
          className="resize-none rounded-xl border-input bg-background transition-smooth focus-visible:shadow-glow focus-visible:ring-ring/50"
        />
      </div>

      {error && (
        <p
          role="alert"
          data-ocid="tasks.edit.error_state"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          data-ocid="tasks.edit.delete_button"
          onClick={() => onRequestDelete(task)}
          className="mr-auto rounded-lg text-destructive transition-smooth hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          删除
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="tasks.edit.cancel_button"
            onClick={onClose}
            className="rounded-lg transition-smooth active:scale-95"
          >
            取消
          </Button>
          <Button
            type="submit"
            data-ocid="tasks.edit.save_button"
            disabled={updateTask.isPending}
            className="rounded-lg px-5 font-semibold transition-smooth hover:-translate-y-px hover:shadow-subtle active:translate-y-0 active:scale-95"
          >
            {updateTask.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            保存
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
