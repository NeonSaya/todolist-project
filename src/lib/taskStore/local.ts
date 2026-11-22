import { addDays, parseLocalDate } from "@/lib/tasks";
import { Priority, type Task, type TaskFields } from "@/types";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { TASK_NOT_FOUND, type TaskStore } from "./types";

interface TaskList {
  nextId: bigint;
  tasks: Task[];
}

interface Database extends DBSchema {
  lists: { key: string; value: TaskList };
}

const LIST = "default";
let database: Promise<IDBPDatabase<Database>> | undefined;

function getDatabase() {
  database ??= openDB<Database>("shixu-tasks", 1, {
    upgrade(db) {
      db.createObjectStore("lists");
    },
    terminated() {
      database = undefined;
    },
  }).catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}

function now() {
  return BigInt(Date.now()) * 1_000_000n;
}

function append(list: TaskList, fields: TaskFields, createdAt: bigint): Task {
  const task: Task = {
    ...fields,
    id: list.nextId++,
    createdAt,
    completed: false,
    completedAt: null,
  };
  list.tasks.push(task);
  return task;
}

function newList(today?: string): TaskList {
  const list: TaskList = { nextId: 1n, tasks: [] };
  if (!today) return list;

  const samples = [
    ["整理本周的工作计划", Priority.high, 0, "先列出三件最重要的事"],
    ["回复客户的邮件", Priority.medium, 0, null],
    ["去超市采购日用品", Priority.low, 0, "牛奶、鸡蛋、纸巾"],
    ["晨跑 30 分钟", Priority.low, 0, null, true],
    ["缴纳本月水电费", Priority.high, -1, "已经逾期，尽快处理"],
    ["预约牙医复诊", Priority.medium, 1, null],
    ["准备周五的项目汇报", Priority.high, 3, "整理数据并做好演示文稿"],
    ["给家人打个电话", Priority.low, 5, null],
  ] as const;
  const createdAt = now();
  for (const [title, priority, offset, note, completed] of samples) {
    const task = append(
      list,
      { title, priority, date: addDays(today, offset), note },
      createdAt,
    );
    if (completed) {
      task.completed = true;
      task.completedAt = createdAt;
    }
  }
  return list;
}

function validate(fields: TaskFields, position = ""): TaskFields {
  const title = fields.title.trim();
  if (!title) throw new Error(`${position}标题不能为空`);
  if (fields.date !== null && !parseLocalDate(fields.date)) {
    throw new Error(
      `${position}日期「${fields.date}」无效，应为 YYYY-MM-DD 格式`,
    );
  }
  return { ...fields, title };
}

// Updates share a read/write transaction so simultaneous saves always start from the latest list.
async function change<T>(
  update: (list: TaskList) => T,
  seedDate?: string,
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction("lists", "readwrite", {
    durability: "strict",
  });
  try {
    const list = (await transaction.store.get(LIST)) ?? newList(seedDate);
    const result = update(list);
    await Promise.all([transaction.store.put(list, LIST), transaction.done]);
    return result;
  } catch (error) {
    await transaction.done.catch(() => {});
    if (error instanceof DOMException) {
      throw new Error(
        error.name === "QuotaExceededError"
          ? "本地存储空间不足，请腾出空间后重试"
          : "无法写入本地任务库，请重试",
      );
    }
    throw error;
  }
}

function findTask(list: TaskList, id: Task["id"]): Task {
  const task = list.tasks.find((item) => item.id === id);
  if (!task) throw new Error(TASK_NOT_FOUND);
  return task;
}

export const localTaskStore: TaskStore = {
  async list(today) {
    try {
      const db = await getDatabase();
      const list = await db.get("lists", LIST);
      return list?.tasks ?? (await change((initial) => initial.tasks, today));
    } catch {
      throw new Error("无法打开本地任务库，请检查磁盘空间或浏览器存储权限");
    }
  },
  async create(fields) {
    const clean = validate(fields);
    return change((list) => append(list, clean, now()));
  },
  async createMany(fields) {
    const clean = fields.map((task, index) =>
      validate(task, `第 ${index + 1} 项：`),
    );
    if (clean.length === 0) return [];
    return change((list) => {
      const createdAt = now();
      return clean.map((task) => append(list, task, createdAt));
    });
  },
  async update(id, fields) {
    const clean = validate(fields);
    return change((list) => Object.assign(findTask(list, id), clean));
  },
  async complete(id, completed) {
    return change((list) => {
      const task = findTask(list, id);
      if (task.completed !== completed) {
        task.completed = completed;
        task.completedAt = completed ? now() : null;
      }
      return task;
    });
  },
  async remove(id) {
    await change((list) => {
      const index = list.tasks.findIndex((task) => task.id === id);
      if (index < 0) throw new Error(TASK_NOT_FOUND);
      list.tasks.splice(index, 1);
    });
  },
};
