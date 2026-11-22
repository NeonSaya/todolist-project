import { todayString } from "@/lib/tasks";
import { useSyncExternalStore } from "react";

function subscribe(notify: () => void) {
  let timer: number;

  function refresh() {
    notify();
    window.clearTimeout(timer);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    timer = window.setTimeout(refresh, tomorrow.getTime() - now.getTime());
  }

  refresh();
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

export function useToday() {
  return useSyncExternalStore(subscribe, todayString);
}
