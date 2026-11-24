import { useListTasks } from "@/hooks/useQueries";
import { useToday } from "@/hooks/useToday";
import { viewCounts } from "@/lib/tasks";
import { Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { MobileBottomNav, MobileHeader } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const { data: tasks } = useListTasks();
  const today = useToday();
  const counts = useMemo(() => viewCounts(tasks ?? [], today), [tasks, today]);

  return (
    <div className="min-h-dvh">
      <Sidebar counts={counts} />
      <MobileHeader />

      <div className="flex min-h-dvh flex-col md:pl-64">
        <main className="flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-14 md:pt-12">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav counts={counts} />
    </div>
  );
}
