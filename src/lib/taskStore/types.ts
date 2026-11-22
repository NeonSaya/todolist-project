import type { Task, TaskFields, TaskId } from "@/types";

export interface TaskStore {
  list(today: string): Promise<Task[]>;
  create(fields: TaskFields): Promise<Task>;
  createMany(fields: TaskFields[]): Promise<Task[]>;
  update(id: TaskId, fields: TaskFields): Promise<Task>;
  complete(id: TaskId, completed: boolean): Promise<Task>;
  remove(id: TaskId): Promise<void>;
}

export const TASK_NOT_FOUND = "任务不存在或已被删除";
