import {
  type Result,
  type Task,
  type TaskId,
  type TaskInput,
  createActor,
} from "@/backend";
import { taskErrorMessage, todayString } from "@/lib/tasks";
import type { TaskFields } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const queryKeys = {
  tasks: ["tasks"] as const,
};

const NOT_READY = "服务尚未就绪，请稍后再试";

function unwrap(result: Result): Task {
  if (result.__kind__ === "err") throw new Error(taskErrorMessage(result.err));
  return result.ok;
}

export function useListTasks(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Task[]>({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTasks();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskFields) => {
      if (!actor) throw new Error(NOT_READY);
      return unwrap(
        await actor.createTask(
          input.title,
          input.priority,
          input.date,
          input.note,
        ),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

/** Bulk-create tasks (used by 智能添加). */
export function useCreateTasks() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: TaskFields[]) => {
      if (!actor) throw new Error(NOT_READY);
      const payload: TaskInput[] = inputs.map((i) => ({
        title: i.title,
        priority: i.priority,
        ...(i.date ? { date: i.date } : {}),
        ...(i.note ? { note: i.note } : {}),
      }));
      const result = await actor.createTasks(payload);
      if (result.__kind__ === "err") {
        throw new Error(taskErrorMessage(result.err));
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TaskFields & { id: TaskId }) => {
      if (!actor) throw new Error(NOT_READY);
      return unwrap(
        await actor.updateTask(
          id,
          input.title,
          input.priority,
          input.date,
          input.note,
        ),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

/** Toggle completion with an optimistic cache update and rollback on error. */
export function useSetTaskCompleted() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      completed,
    }: { id: TaskId; completed: boolean }) => {
      if (!actor) throw new Error(NOT_READY);
      return unwrap(await actor.setTaskCompleted(id, completed));
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks);
      const now = BigInt(Date.now()) * 1_000_000n;
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (old) =>
        old?.map((t) =>
          t.id === id
            ? { ...t, completed, completedAt: completed ? now : undefined }
            : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: TaskId) => {
      if (!actor) throw new Error(NOT_READY);
      const ok = await actor.deleteTask(id);
      if (!ok) throw new Error("任务不存在或已被删除");
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

function useEnsureSampleTasks() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (today: string) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.ensureSampleTasks(today);
    },
    onSuccess: (tasks) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, tasks);
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

/** Calls ensureSampleTasks once per mount with today's local date, when the actor is ready. */
export function useEnsureSampleTasksOnce(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  const { mutate } = useEnsureSampleTasks();
  const ran = useRef(false);
  useEffect(() => {
    if (!enabled || !actor || isFetching || ran.current) return;
    ran.current = true;
    mutate(todayString());
  }, [enabled, actor, isFetching, mutate]);
}
