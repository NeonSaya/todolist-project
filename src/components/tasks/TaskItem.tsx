import { useSetTaskCompleted } from "@/hooks/useQueries";
import {
  PRIORITY_META,
  datePillClass,
  dateState,
  formatDateChip,
} from "@/lib/tasks";
import type { Task } from "@/types";
import { Check, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PRIORITY_STYLE } from "./priorityStyles";

interface TaskItemProps {
  task: Task;
  index: number;
  today: string;
  showDate: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const chip =
  "tabular inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] font-semibold leading-none transition-smooth";

export function TaskItem({
  task,
  index,
  today,
  showDate,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const setCompleted = useSetTaskCompleted();
  const done = setCompleted.isPending
    ? setCompleted.variables.completed
    : task.completed;
  const meta = PRIORITY_META[task.priority];
  const style = PRIORITY_STYLE[task.priority];
  const state = dateState(task.date, today, done);
  const overdue = state === "overdue";
  const showDateChip = !!task.date && (showDate || overdue);

  const changeCompletion = async (completed: boolean, undo = false) => {
    try {
      await setCompleted.mutateAsync({ id: task.id, completed });
      if (completed) {
        toast.success("完成一项任务", {
          description: task.title,
          action: {
            label: "撤销",
            onClick: () => void changeCompletion(false, true),
          },
        });
      } else {
        toast.success("已恢复为未完成", { description: task.title });
      }
    } catch (error) {
      toast.error(undo ? "撤销失败" : "更新失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 overflow-hidden rounded-xl border px-3.5 py-3 transition-smooth md:px-4 ${
        done
          ? "border-border bg-muted/60 shadow-none"
          : "surface-card surface-card-hover"
      }`}
    >
      {overdue && (
        <span
          className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-destructive"
          aria-hidden
        />
      )}
      <button
        type="button"
        data-ocid={`tasks.checkbox.${index}`}
        aria-pressed={done}
        aria-label={`${done ? "标记为未完成" : "标记为完成"}：${task.title}`}
        onClick={() => void changeCompletion(!done)}
        disabled={setCompleted.isPending}
        className="focus-ring -m-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-smooth active:scale-90"
      >
        <span
          className={`inline-flex h-[1.15rem] w-[1.15rem] items-center justify-center rounded-full border-2 transition-smooth ${
            done
              ? "border-success bg-success text-success-foreground motion-safe:animate-check-pop"
              : `${style.ring} group-hover:bg-secondary`
          }`}
        >
          {done && <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />}
        </span>
      </button>

      <div className="min-w-0 flex-1 pt-px">
        <button
          type="button"
          onClick={() => onEdit(task)}
          data-ocid={`tasks.title_button.${index}`}
          className="focus-ring -mx-1 block max-w-full rounded-md px-1 text-left text-[15px] font-semibold leading-snug transition-smooth hover:text-primary"
        >
          <span
            className={`box-decoration-clone break-words bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_55%] bg-no-repeat transition-colors duration-300 ${
              done
                ? "font-medium text-muted-foreground motion-safe:animate-strike motion-reduce:line-through"
                : "text-foreground"
            }`}
          >
            {task.title}
          </span>
        </button>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={`${chip} ${done ? "pill-date-neutral" : style.pill}`}
          >
            <span className="sr-only">优先级：</span>
            {meta.label}
          </span>
          {showDateChip && task.date && (
            <span
              className={`${chip} ${done ? "pill-date-neutral" : datePillClass(task.date, today, done)}`}
            >
              {overdue && "逾期 · "}
              {formatDateChip(task.date, today)}
            </span>
          )}
          {task.note && (
            <span className="ml-0.5 flex min-w-0 max-w-full flex-1 items-center gap-1">
              <NotebookPen className="h-3 w-3 shrink-0" aria-hidden />
              <span className="line-clamp-1 break-all">{task.note}</span>
            </span>
          )}
        </div>
      </div>

      <div className="-mr-1 flex shrink-0 items-center gap-0.5 transition-smooth md:pointer-events-none md:translate-x-1 md:opacity-0 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100 md:group-hover:pointer-events-auto md:group-hover:translate-x-0 md:group-hover:opacity-100">
        <button
          type="button"
          data-ocid={`tasks.edit_button.${index}`}
          aria-label={`编辑：${task.title}`}
          onClick={() => onEdit(task)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-smooth hover:bg-secondary hover:text-primary active:scale-90 md:h-8 md:w-8 md:rounded-lg"
        >
          <Pencil className="h-4 w-4 md:h-3.5 md:w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          data-ocid={`tasks.delete_button.${index}`}
          aria-label={`删除：${task.title}`}
          onClick={() => onDelete(task)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive active:scale-90 md:h-8 md:w-8 md:rounded-lg"
        >
          <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
