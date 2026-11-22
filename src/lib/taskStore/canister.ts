import { Priority, type Task, type TaskFields } from "@/types";
import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import {
  type Task as CanisterTask,
  type TaskError,
  type TaskInput,
  type _SERVICE,
  idlFactory,
} from "./backend.did";
import { TASK_NOT_FOUND, type TaskStore } from "./types";

function optional(value: string | null): [] | [string] {
  return value === null ? [] : [value];
}

function encode(fields: TaskFields): TaskInput {
  return {
    title: fields.title,
    priority: { [fields.priority]: null } as TaskInput["priority"],
    date: optional(fields.date),
    note: optional(fields.note),
  };
}

function decode(task: CanisterTask): Task {
  const { id, title, completed, createdAt, completedAt, date, note, priority } =
    task;
  return {
    id,
    title,
    completed,
    createdAt,
    completedAt: completedAt[0] ?? null,
    date: date[0] ?? null,
    note: note[0] ?? null,
    priority:
      "high" in priority
        ? Priority.high
        : "low" in priority
          ? Priority.low
          : Priority.medium,
  };
}

function unwrap<T>(result: { ok: T } | { err: TaskError }): T {
  if ("ok" in result) return result.ok;
  throw new Error(
    "invalidInput" in result.err ? result.err.invalidInput : TASK_NOT_FOUND,
  );
}

export async function createCanisterTaskStore(
  canisterId: string,
  host = "https://icp-api.io",
): Promise<TaskStore> {
  const { hostname } = new URL(host);
  const local =
    ["localhost", "127.0.0.1", "[::1]"].includes(hostname) ||
    hostname.endsWith(".localhost");
  const agent = await HttpAgent.create({ host, shouldFetchRootKey: local });
  const actor = Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId });
  let checkedSamples = false;

  return {
    async list(today) {
      let tasks = await actor.listTasks();
      if (!checkedSamples && tasks.length === 0) {
        tasks = await actor.ensureSampleTasks(today);
      }
      checkedSamples = true;
      return tasks.map(decode);
    },
    async create(fields) {
      const { title, priority, date, note } = encode(fields);
      return decode(
        unwrap(await actor.createTask(title, priority, date, note)),
      );
    },
    async createMany(fields) {
      return unwrap(await actor.createTasks(fields.map(encode))).map(decode);
    },
    async update(id, fields) {
      const { title, priority, date, note } = encode(fields);
      return decode(
        unwrap(await actor.updateTask(id, title, priority, date, note)),
      );
    },
    async complete(id, completed) {
      return decode(unwrap(await actor.setTaskCompleted(id, completed)));
    },
    async remove(id) {
      if (!(await actor.deleteTask(id))) throw new Error(TASK_NOT_FOUND);
    },
  };
}
