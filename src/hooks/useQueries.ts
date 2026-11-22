import { getTaskStore } from "@/lib/taskStore";
import type { TaskStore } from "@/lib/taskStore/types";
import { todayString } from "@/lib/tasks";
import type { TaskFields, TaskId } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const tasksKey = ["tasks"] as const;

export function useListTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: async () => (await getTaskStore()).list(todayString()),
  });
}

function useTaskMutation<T, V>(
  run: (store: TaskStore, variables: V) => Promise<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: V) => run(await getTaskStore(), variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useCreateTask() {
  return useTaskMutation((store, fields: TaskFields) => store.create(fields));
}

export function useCreateTasks() {
  return useTaskMutation((store, fields: TaskFields[]) =>
    store.createMany(fields),
  );
}

export function useUpdateTask() {
  return useTaskMutation(
    (store, { id, ...fields }: TaskFields & { id: TaskId }) =>
      store.update(id, fields),
  );
}

export function useSetTaskCompleted() {
  return useTaskMutation(
    (store, { id, completed }: { id: TaskId; completed: boolean }) =>
      store.complete(id, completed),
  );
}

export function useDeleteTask() {
  return useTaskMutation((store, id: TaskId) => store.remove(id));
}
