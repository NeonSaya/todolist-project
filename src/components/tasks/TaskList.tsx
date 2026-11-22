import {
  dateTextClass,
  formatDateChip,
  formatDayHeading,
  groupTasksByDate,
  sortTasks,
} from "@/lib/tasks";
import type { Task, TaskView } from "@/types";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  view: TaskView;
  today: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface ListGroup {
  key: string;
  title: string | null;
  hint: string | null;
  hintClass: string;
  dot: string;
  tasks: Task[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

function buildGroups(
  tasks: Task[],
  view: TaskView,
  today: string,
): ListGroup[] {
  if (view === "upcoming") {
    return groupTasksByDate(sortTasks(tasks)).map((g) => ({
      key: g.date ?? "none",
      title: g.date ? formatDayHeading(g.date) : "未定日期",
      hint: g.date ? formatDateChip(g.date, today) : null,
      hintClass: dateTextClass(g.date, today),
      dot: g.date === tasks[0]?.date ? "bg-primary" : "bg-muted-foreground",
      tasks: g.tasks,
    }));
  }
  if (view === "today" || view === "all") {
    const open = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    return [
      {
        key: "open",
        title: "进行中",
        hint: null,
        hintClass: "",
        dot: "bg-primary",
        tasks: open,
      },
      {
        key: "done",
        title: "已完成",
        hint: null,
        hintClass: "",
        dot: "bg-success",
        tasks: done,
      },
    ].filter((g) => g.tasks.length > 0);
  }
  return [
    { key: view, title: null, hint: null, hintClass: "", dot: "", tasks },
  ];
}

export function TaskList({
  tasks,
  view,
  today,
  onEdit,
  onDelete,
}: TaskListProps) {
  const reduce = useReducedMotion();
  const groups = buildGroups(tasks, view, today);
  let position = 0;

  return (
    <div data-ocid="tasks.list" className="space-y-7">
      {groups.map((group, gi) => (
        <section
          key={group.key}
          aria-label={group.title ?? undefined}
          data-ocid={`tasks.group.${gi + 1}`}
        >
          {group.title && (
            <h3 className="mb-2.5 flex items-center gap-2 px-1 font-body text-[13px] font-semibold text-foreground">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${group.dot}`}
                aria-hidden
              />
              <span className="truncate">{group.title}</span>
              {group.hint && (
                <span className={`text-xs font-semibold ${group.hintClass}`}>
                  {group.hint}
                </span>
              )}
              <span className="tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[11px] font-semibold text-secondary-foreground">
                {group.tasks.length}
              </span>
              <span className="ml-1 h-px flex-1 bg-border" aria-hidden />
            </h3>
          )}
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {group.tasks.map((task) => {
                position += 1;
                const stagger = Math.min(position - 1, 8) * 0.035;
                return (
                  <motion.li
                    key={task.id.toString()}
                    data-ocid={`tasks.item.${position}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: reduce ? 0 : 0.32,
                        ease: EASE,
                        delay: reduce ? 0 : stagger,
                      },
                    }}
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0 } }
                        : {
                            opacity: 0,
                            scale: 0.98,
                            transition: { duration: 0.22, ease: EASE },
                          }
                    }
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <TaskItem
                      task={task}
                      index={position}
                      today={today}
                      showDate={view !== "upcoming" && view !== "today"}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
