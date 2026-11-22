import type { Priority, Task } from "@/backend";

export { Priority } from "@/backend";
export type { Task, TaskError, TaskId, TaskInput } from "@/backend";

/** Views shown in the sidebar and kept in the URL as `?view=`. */
export type TaskView = "today" | "upcoming" | "overdue" | "all" | "completed";

/** Form-level task fields; empty date/note are `null`. */
export interface TaskFields {
  title: string;
  priority: Priority;
  date: string | null;
  note: string | null;
}

export interface TaskDateGroup {
  date: string | null;
  tasks: Task[];
}
