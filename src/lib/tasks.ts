import {
  Priority,
  type Task,
  type TaskDateGroup,
  type TaskView,
} from "@/types";

export const TASK_VIEWS: readonly TaskView[] = [
  "today",
  "upcoming",
  "overdue",
  "all",
  "completed",
];

export const VIEW_LABELS: Record<TaskView, string> = {
  today: "今天",
  upcoming: "即将到来",
  overdue: "已逾期",
  all: "全部",
  completed: "已完成",
};

export const VIEW_DESCRIPTIONS: Record<TaskView, string> = {
  today: "专注今天要完成的事",
  upcoming: "按日期提前规划接下来的安排",
  overdue: "过了日期还没完成的任务",
  all: "所有任务，按日期与优先级排列",
  completed: "已经完成的任务记录",
};

export function isTaskView(value: unknown): value is TaskView {
  return (
    typeof value === "string" &&
    (TASK_VIEWS as readonly string[]).includes(value)
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateString(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local (not UTC) today as YYYY-MM-DD. */
export function todayString(): string {
  return toDateString(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr) ?? new Date();
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

export function parseLocalDate(dateStr: string): Date | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!parts || parts[1] === "0000") return null;
  const date = new Date(2000, 0, 1);
  date.setFullYear(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  return toDateString(date) === dateStr ? date : null;
}

export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** "11月22日 周日" */
export function formatDayHeading(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
}

/** Short chip label: 今天 / 明天 / 昨天 / 11-22 (with year when not current). */
export function formatDateChip(dateStr: string, today: string): string {
  if (dateStr === today) return "今天";
  if (dateStr === addDays(today, 1)) return "明天";
  if (dateStr === addDays(today, -1)) return "昨天";
  const [y, m, d] = dateStr.split("-");
  return y === today.slice(0, 4) ? `${m}-${d}` : `${y}-${m}-${d}`;
}

export const PRIORITY_ORDER: readonly Priority[] = [
  Priority.high,
  Priority.medium,
  Priority.low,
];

export const PRIORITY_META: Record<
  Priority,
  { label: string; rank: number; dot: string; pill: string; ring: string }
> = {
  [Priority.high]: {
    label: "高",
    rank: 0,
    dot: "bg-priority-high",
    pill: "pill-priority-high",
    ring: "border-priority-high",
  },
  [Priority.medium]: {
    label: "中",
    rank: 1,
    dot: "bg-priority-medium",
    pill: "pill-priority-medium",
    ring: "border-priority-medium",
  },
  [Priority.low]: {
    label: "低",
    rank: 2,
    dot: "bg-priority-low",
    pill: "pill-priority-low",
    ring: "border-priority-low",
  },
};

export type DateState = "today" | "tomorrow" | "overdue" | "future" | "none";

/** Classify a YYYY-MM-DD date relative to today. Completed tasks are never overdue. */
export function dateState(
  date: string | null | undefined,
  today: string,
  completed = false,
): DateState {
  if (!date) return "none";
  if (date === today) return "today";
  if (date === addDays(today, 1)) return "tomorrow";
  if (date < today) return completed ? "future" : "overdue";
  return "future";
}

/** Soft pill classes per date state (theme-aware utilities from index.css). */
export const DATE_PILL_CLASS: Record<DateState, string> = {
  today: "pill-date-today",
  tomorrow: "pill-date-tomorrow",
  overdue: "pill-date-overdue",
  future: "pill-date-neutral",
  none: "pill-date-neutral",
};

/** Text-only color per date state. */
export const DATE_TEXT_CLASS: Record<DateState, string> = {
  today: "text-date-today",
  tomorrow: "text-date-tomorrow",
  overdue: "text-date-overdue",
  future: "text-muted-foreground",
  none: "text-muted-foreground",
};

export function datePillClass(
  date: string | null | undefined,
  today: string,
  completed = false,
): string {
  return DATE_PILL_CLASS[dateState(date, today, completed)];
}

export function dateTextClass(
  date: string | null | undefined,
  today: string,
  completed = false,
): string {
  return DATE_TEXT_CLASS[dateState(date, today, completed)];
}

/** Date ascending (undated last), then priority 高 → 中 → 低, then creation order. */
export function compareTasks(a: Task, b: Task): number {
  if (a.date !== b.date) {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date < b.date ? -1 : 1;
  }
  const p = PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
  if (p !== 0) return p;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(compareTasks);
}

/** Open tasks first (sorted), completed tasks after. */
function openThenDone(tasks: Task[]): Task[] {
  const sorted = sortTasks(tasks);
  return [
    ...sorted.filter((t) => !t.completed),
    ...sorted.filter((t) => t.completed),
  ];
}

export function filterTasksByView(
  tasks: Task[],
  view: TaskView,
  today: string,
): Task[] {
  switch (view) {
    case "today":
      // Today's tasks, open first; completed ones stay visible for progress.
      return openThenDone(tasks.filter((t) => t.date === today));
    case "upcoming":
      return sortTasks(
        tasks.filter((t) => !t.completed && !!t.date && t.date > today),
      );
    case "overdue":
      return sortTasks(
        tasks.filter((t) => !t.completed && !!t.date && t.date < today),
      );
    case "all":
      return openThenDone(tasks);
    case "completed":
      return [...tasks]
        .filter((t) => t.completed)
        .sort((a, b) => {
          const ca = a.completedAt ?? 0n;
          const cb = b.completedAt ?? 0n;
          return ca > cb ? -1 : ca < cb ? 1 : 0;
        });
  }
}

/** Group already-sorted tasks by date, preserving order. */
export function groupTasksByDate(tasks: Task[]): TaskDateGroup[] {
  const groups: TaskDateGroup[] = [];
  for (const task of tasks) {
    const date = task.date ?? null;
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.tasks.push(task);
    else groups.push({ date, tasks: [task] });
  }
  return groups;
}

/** Sidebar badge counts: open tasks per view, total for completed. */
export function viewCounts(
  tasks: Task[],
  today: string,
): Record<TaskView, number> {
  const counts: Record<TaskView, number> = {
    today: 0,
    upcoming: 0,
    overdue: 0,
    all: 0,
    completed: 0,
  };
  for (const t of tasks) {
    if (t.completed) {
      counts.completed += 1;
      continue;
    }
    counts.all += 1;
    if (!t.date) continue;
    if (t.date === today) counts.today += 1;
    else if (t.date > today) counts.upcoming += 1;
    else counts.overdue += 1;
  }
  return counts;
}

/** Completed of total tasks dated today. */
export function todayProgress(
  tasks: Task[],
  today: string,
): { completed: number; total: number; percent: number } {
  const dated = tasks.filter((t) => t.date === today);
  const completed = dated.filter((t) => t.completed).length;
  const total = dated.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/** Highest-priority open task for today (or overdue), used for the spotlight card. */
export function spotlightTask(tasks: Task[], today: string): Task | null {
  const candidates = sortTasks(
    tasks.filter((t) => !t.completed && !!t.date && t.date <= today),
  ).sort(
    (a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank,
  );
  return candidates[0] ?? null;
}
