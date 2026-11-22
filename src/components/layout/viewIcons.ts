import type { TaskView } from "@/types";
import {
  CalendarDays,
  CalendarRange,
  CircleAlert,
  CircleCheckBig,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

export const VIEW_ICONS: Record<TaskView, LucideIcon> = {
  today: CalendarDays,
  upcoming: CalendarRange,
  overdue: CircleAlert,
  all: ListTodo,
  completed: CircleCheckBig,
};
