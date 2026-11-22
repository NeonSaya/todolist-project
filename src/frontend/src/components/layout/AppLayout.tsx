import { useListTasks } from "@/hooks/useQueries";
import { todayString, viewCounts } from "@/lib/tasks";
import { Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { MobileBottomNav, MobileHeader } from "./MobileNav";
import { Sidebar } from "./Sidebar";

function Attribution({ className }: { className: string }) {
  const year = new Date().getFullYear();
  const host = encodeURIComponent(window.location.hostname);
  return (
    <p className={className}>
      © {year}. Built with love using{" "}
      <a
        href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${host}`}
        target="_blank"
        rel="noreferrer"
        className="focus-ring rounded font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline"
      >
        caffeine.ai
      </a>
    </p>
  );
}

export function AppLayout() {
  const { data: tasks = [] } = useListTasks();
  const today = todayString();
  const counts = useMemo(() => viewCounts(tasks, today), [tasks, today]);

  return (
    <div className="min-h-dvh">
      <Sidebar counts={counts} />
      <MobileHeader />

      <div className="flex min-h-dvh flex-col md:pl-64">
        <main className="flex-1 px-4 pb-8 pt-6 md:px-10 md:pb-14 md:pt-12">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
        <footer className="hidden border-t border-border transition-theme md:block">
          <Attribution className="mx-auto max-w-3xl px-10 py-5 text-center text-xs text-muted-foreground" />
        </footer>
        <footer className="md:hidden">
          <Attribution className="px-4 pb-28 text-center text-[11px] text-muted-foreground" />
        </footer>
      </div>

      <MobileBottomNav counts={counts} />
    </div>
  );
}
