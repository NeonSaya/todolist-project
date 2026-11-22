import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { QuickAddForm } from "@/components/tasks/QuickAddForm";
import { TaskList } from "@/components/tasks/TaskList";
import {
  TasksEmpty,
  TasksError,
  TasksSkeleton,
} from "@/components/tasks/TaskStates";
import { TodayOverview } from "@/components/tasks/TodayOverview";
import { useListTasks } from "@/hooks/useQueries";
import { useToday } from "@/hooks/useToday";
import {
  VIEW_DESCRIPTIONS,
  VIEW_LABELS,
  filterTasksByView,
  formatDayHeading,
} from "@/lib/tasks";
import type { Task, TaskView } from "@/types";
import { useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";

function PageHeader({
  view,
  today,
  count,
}: {
  view: TaskView;
  today: string;
  count: number | null;
}) {
  return (
    <header
      data-ocid="tasks.header.section"
      className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-1 motion-safe:animate-fade-up"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {VIEW_LABELS[view]}
          </h1>
          {view === "today" && (
            <span className="tabular text-base font-medium text-muted-foreground md:text-lg">
              {formatDayHeading(today)}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {VIEW_DESCRIPTIONS[view]}
        </p>
      </div>
      {count !== null && (
        <span
          data-ocid="tasks.header.count"
          className={`tabular inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-theme ${
            view === "overdue" && count > 0
              ? "pill-date-overdue"
              : "border border-border bg-card text-secondary-foreground shadow-xs"
          }`}
        >
          {count} 项
        </span>
      )}
    </header>
  );
}

export default function TasksPage({ view }: { view: TaskView }) {
  const {
    data: tasks,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useListTasks();
  const today = useToday();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const visible = useMemo(
    () => filterTasksByView(tasks ?? [], view, today),
    [tasks, view, today],
  );

  if (isError && !tasks) {
    return (
      <section data-ocid="tasks.page" className="space-y-6 md:space-y-8">
        <PageHeader view={view} today={today} count={null} />
        <TasksError
          message={error instanceof Error ? error.message : ""}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      </section>
    );
  }

  if (isPending || !tasks) {
    return (
      <section data-ocid="tasks.page">
        <TasksSkeleton />
      </section>
    );
  }

  const focusAdd = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <section data-ocid="tasks.page" className="space-y-6 md:space-y-8">
      <PageHeader view={view} today={today} count={visible.length} />

      {view === "today" && (
        <TodayOverview tasks={tasks} today={today} onEdit={setEditing} />
      )}

      <QuickAddForm view={view} today={today} inputRef={inputRef} />

      <section aria-label={`${VIEW_LABELS[view]}任务`}>
        {visible.length === 0 ? (
          <TasksEmpty key={view} view={view} onFocusAdd={focusAdd} />
        ) : (
          <TaskList
            key={view}
            tasks={visible}
            view={view}
            today={today}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}
      </section>

      <EditTaskDialog
        task={editing}
        today={today}
        onClose={() => setEditing(null)}
        onRequestDelete={(task) => {
          setEditing(null);
          setDeleting(task);
        }}
      />
      <DeleteTaskDialog task={deleting} onClose={() => setDeleting(null)} />
    </section>
  );
}
