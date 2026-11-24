import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { isTaskView } from "@/lib/tasks";
import SettingsPage from "@/pages/SettingsPage";
import SmartAddPage from "@/pages/SmartAddPage";
import TasksPage from "@/pages/TasksPage";
import type { TaskView } from "@/types";
import {
  Navigate,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({ component: AppLayout });

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): { view: TaskView } => ({
    view: isTaskView(search.view) ? search.view : "today",
  }),
  component: function TasksRouteView() {
    const { view } = tasksRoute.useSearch();
    return <TasksPage view={view} />;
  },
});

const smartAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/smart-add",
  component: SmartAddPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([tasksRoute, smartAddRoute, settingsRoute]),
  basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
  history: import.meta.env.MODE === "desktop" ? createHashHistory() : undefined,
  defaultNotFoundComponent: () => (
    <Navigate to="/" search={{ view: "today" }} />
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton duration={4500} />
    </>
  );
}
