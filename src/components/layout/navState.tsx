import type { TaskView } from "@/types";
import { useRouterState, useSearch } from "@tanstack/react-router";

export function useNavState() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useSearch({ strict: false });
  const onTasks = pathname === "/";
  const activeView: TaskView | null = onTasks ? (search.view ?? "today") : null;
  return {
    activeView,
    onSmartAdd: pathname.startsWith("/smart-add"),
    onSettings: pathname.startsWith("/settings"),
  };
}

/** Tone classes for a view count; overdue gets the gentle warning pill. */
export function countTone(view: TaskView, active: boolean): string {
  if (view === "overdue") return "pill-date-overdue";
  return active
    ? "bg-card text-sidebar-accent-foreground shadow-xs"
    : "bg-secondary text-muted-foreground";
}

export function CountBadge({
  view,
  count,
  active,
}: { view: TaskView; count: number; active: boolean }) {
  if (count === 0 || view === "completed") return null;
  return (
    <span
      className={`tabular ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-semibold transition-theme ${countTone(view, active)}`}
    >
      {count}
      <span className="sr-only">项</span>
    </span>
  );
}
