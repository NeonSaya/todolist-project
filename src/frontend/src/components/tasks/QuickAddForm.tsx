import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/hooks/useQueries";
import { addDays } from "@/lib/tasks";
import { Priority, type TaskView } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  CornerDownLeft,
  Loader2,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";
import { type FormEvent, type RefObject, useId, useState } from "react";
import { toast } from "sonner";
import { DateField } from "./DateField";
import { PrioritySelect } from "./PrioritySelect";

const NOTE_MAX = 200;

interface QuickAddFormProps {
  view: TaskView;
  today: string;
  inputRef: RefObject<HTMLInputElement | null>;
}

function defaultDateFor(view: TaskView, today: string): string | null {
  if (view === "today") return today;
  if (view === "upcoming") return addDays(today, 1);
  return null;
}

export function QuickAddForm({ view, today, inputRef }: QuickAddFormProps) {
  const createTask = useCreateTask();
  const inputId = useId();
  const noteId = useId();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  // undefined = the user has not chosen a date; fall back to the view default.
  const [date, setDate] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const effectiveDate = date === undefined ? defaultDateFor(view, today) : date;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const captured = title.trim();
    const capturedNote = note.trim();
    if (!captured) {
      setError("请先输入任务内容");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setTitle("");
    setNote("");
    setShowNote(false);
    createTask.mutate(
      {
        title: captured,
        priority,
        date: effectiveDate,
        note: capturedNote ? capturedNote : null,
      },
      {
        onSuccess: () => toast.success("已添加任务", { description: captured }),
        onError: (err) => {
          setTitle((current) => (current === "" ? captured : current));
          if (capturedNote) {
            setNote((current) => (current === "" ? capturedNote : current));
            setShowNote(true);
          }
          const message = err.message || "添加失败，请重试";
          setError(message);
          toast.error("添加失败", { description: message });
        },
      },
    );
    setPriority(Priority.medium);
    setDate(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="tasks.add.panel"
      className="surface-card group/add p-1.5 transition-smooth focus-within:-translate-y-px focus-within:border-primary/40 focus-within:shadow-glow motion-safe:animate-fade-up"
    >
      <div className="flex items-center gap-2.5 pl-2.5 pr-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-smooth group-focus-within/add:rotate-90">
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </span>
        <label htmlFor={inputId} className="sr-only">
          新任务标题
        </label>
        <input
          ref={inputRef}
          id={inputId}
          data-ocid="tasks.add.input"
          value={title}
          maxLength={120}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="添加任务，按 Enter 创建…"
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
        />
        <Link
          to="/smart-add"
          data-ocid="tasks.add.smart_add.link"
          className="focus-ring group/ai ai-border inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-smooth hover:shadow-glow-ai active:scale-95"
        >
          <Sparkles
            className="h-3.5 w-3.5 text-accent transition-smooth group-hover/ai:rotate-12"
            aria-hidden
          />
          <span className="text-gradient-aurora">智能添加</span>
        </Link>
      </div>

      {showNote && (
        <div className="px-3 pb-2 motion-safe:animate-fade-up">
          <label htmlFor={noteId} className="sr-only">
            备注
          </label>
          <input
            id={noteId}
            data-ocid="tasks.add.note.input"
            value={note}
            maxLength={NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder="补充一句备注（可选）"
            className="focus-ring h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground transition-smooth placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted px-2 py-2 transition-theme">
        <PrioritySelect
          value={priority}
          onChange={setPriority}
          ocid="tasks.add.priority"
        />
        <DateField
          value={effectiveDate}
          onChange={setDate}
          today={today}
          ocid="tasks.add.date"
        />
        <button
          type="button"
          data-ocid="tasks.add.note.toggle"
          aria-pressed={showNote}
          onClick={() => setShowNote((v) => !v)}
          className={`focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-smooth active:scale-95 ${
            showNote || note
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <NotebookPen className="h-3.5 w-3.5" aria-hidden />
          备注
        </button>
        <Button
          type="submit"
          data-ocid="tasks.add.submit_button"
          disabled={createTask.isPending}
          className="ml-auto h-9 rounded-full px-4 font-semibold transition-smooth hover:-translate-y-px hover:shadow-glow active:translate-y-0 active:scale-95"
        >
          {createTask.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <CornerDownLeft className="h-4 w-4" aria-hidden />
          )}
          添加
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          data-ocid="tasks.add.field_error"
          className="px-3 pb-1 pt-1.5 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
