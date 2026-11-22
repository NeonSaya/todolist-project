export const Priority = { high: "high", medium: "medium", low: "low" } as const;
export type Priority = (typeof Priority)[keyof typeof Priority];
export type TaskId = bigint;
export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_NOTE_MAX_LENGTH = 1000;

/** Views shown in the sidebar and kept in the URL as `?view=`. */
export type TaskView = "today" | "upcoming" | "overdue" | "all" | "completed";

/** Form-level task fields; empty date/note are `null`. */
export interface TaskFields {
  title: string;
  priority: Priority;
  date: string | null;
  note: string | null;
}

export interface Task extends TaskFields {
  id: TaskId;
  completed: boolean;
  createdAt: bigint;
  completedAt: bigint | null;
}

export interface TaskDateGroup {
  date: string | null;
  tasks: Task[];
}
