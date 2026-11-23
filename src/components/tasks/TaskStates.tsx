import { Button } from "@/components/ui/button";
import type { TaskView } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  CalendarPlus,
  CircleCheckBig,
  ClipboardList,
  RotateCw,
  Sun,
  Trophy,
  WifiOff,
} from "lucide-react";
import type { ReactNode } from "react";

const shimmer =
  "rounded-md bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%] motion-safe:animate-shimmer";

export function TasksSkeleton() {
  const rows = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);
  const stats = Array.from({ length: 3 }, (_, i) => `stat-${i}`);
  return (
    <div
      data-ocid="tasks.loading_state"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6 md:space-y-8"
    >
      <span className="sr-only">正在加载任务…</span>
      <div className="space-y-2 px-1">
        <div className="flex items-end gap-3">
          <div className={`h-10 w-28 ${shimmer}`} />
          <div className={`h-5 w-24 ${shimmer}`} />
        </div>
        <div className={`h-4 w-40 ${shimmer}`} />
      </div>
      <div className="surface-glass flex items-center gap-6 p-5">
        <div className="grid flex-1 grid-cols-3 gap-6">
          {stats.map((id) => (
            <div key={id} className="space-y-2.5">
              <div className={`h-3 w-12 ${shimmer}`} />
              <div className={`h-8 w-10 ${shimmer}`} />
            </div>
          ))}
        </div>
        <div className={`h-[72px] w-[72px] rounded-full ${shimmer}`} />
      </div>
      <div className={`h-[104px] w-full rounded-2xl ${shimmer}`} />
      <div className="space-y-2">
        {rows.map((id, i) => (
          <div
            key={id}
            className="surface-card flex items-start gap-3 px-4 py-3.5"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className={`h-5 w-5 rounded-full ${shimmer}`} />
            <div className="flex-1 space-y-2">
              <div
                className={`h-4 ${shimmer}`}
                style={{ width: `${72 - i * 8}%` }}
              />
              <div className="flex gap-1.5">
                <div className={`h-4 w-8 rounded-full ${shimmer}`} />
                <div className={`h-4 w-12 rounded-full ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Layered icon medallion shared by empty and error states. */
function StateIllustration({
  icon,
  tone,
}: {
  icon: ReactNode;
  tone: "primary" | "danger" | "success";
}) {
  const halo =
    tone === "danger"
      ? "bg-destructive/10"
      : tone === "success"
        ? "bg-success/10"
        : "bg-primary/10";
  const core =
    tone === "danger"
      ? "pill-date-overdue"
      : tone === "success"
        ? "pill-success"
        : "pill-date-today";
  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center"
      aria-hidden
    >
      <span className={`absolute inset-0 rounded-full ${halo}`} />
      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border shadow-card ${core}`}
      >
        {icon}
      </span>
    </div>
  );
}

export function TasksError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div
      data-ocid="tasks.error_state"
      role="alert"
      className="surface-glass flex flex-col items-center px-6 py-14 text-center motion-safe:animate-scale-in"
    >
      <StateIllustration tone="danger" icon={<WifiOff className="h-6 w-6" />} />
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        任务暂时没能加载
      </h2>
      <p className="mt-1.5 max-w-sm break-words text-sm leading-relaxed text-muted-foreground">
        {message || "网络似乎不太稳定。你的任务都安全保存着，请稍后重试。"}
      </p>
      <Button
        type="button"
        data-ocid="tasks.retry_button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-6 rounded-lg px-5 font-semibold transition-smooth hover:-translate-y-px hover:shadow-subtle active:translate-y-0 active:scale-95"
      >
        <RotateCw
          className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
          aria-hidden
        />
        {retrying ? "正在重试…" : "重新加载"}
      </Button>
    </div>
  );
}

const EMPTY: Record<
  TaskView,
  {
    icon: typeof Sun;
    tone: "primary" | "success";
    title: string;
    body: string;
    action: string;
    focus: boolean;
  }
> = {
  today: {
    icon: Sun,
    tone: "primary",
    title: "今天还很清爽",
    body: "写下今天最想完成的一件事，从它开始。",
    action: "添加今天的任务",
    focus: true,
  },
  upcoming: {
    icon: CalendarPlus,
    tone: "primary",
    title: "接下来暂无安排",
    body: "提前规划明天或下周的事，到时候就不会手忙脚乱。",
    action: "规划一个任务",
    focus: true,
  },
  overdue: {
    icon: CircleCheckBig,
    tone: "success",
    title: "没有逾期任务",
    body: "所有事情都在掌控之中，保持这个节奏。",
    action: "查看今天",
    focus: false,
  },
  all: {
    icon: ClipboardList,
    tone: "primary",
    title: "清单还是空的",
    body: "添加第一个任务，设定优先级和日期，让安排一目了然。",
    action: "添加第一个任务",
    focus: true,
  },
  completed: {
    icon: Trophy,
    tone: "success",
    title: "还没有完成的任务",
    body: "完成任务后会在这里留下记录，见证每一点进展。",
    action: "去完成今天的任务",
    focus: false,
  },
};

export function TasksEmpty({
  view,
  onFocusAdd,
}: {
  view: TaskView;
  onFocusAdd: () => void;
}) {
  const e = EMPTY[view];
  const Icon = e.icon;
  return (
    <div
      data-ocid="tasks.empty_state"
      className="flex flex-col items-center rounded-2xl border border-dashed border-input bg-card px-6 py-12 text-center transition-theme motion-safe:animate-fade-up"
    >
      <StateIllustration tone={e.tone} icon={<Icon className="h-6 w-6" />} />
      <h2 className="mt-4 text-xl font-semibold text-foreground">{e.title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {e.body}
      </p>
      {e.focus ? (
        <Button
          type="button"
          data-ocid="tasks.empty.primary_button"
          onClick={onFocusAdd}
          className="mt-6 rounded-lg px-5 font-semibold transition-smooth hover:-translate-y-px hover:shadow-subtle active:translate-y-0 active:scale-95"
        >
          {e.action}
        </Button>
      ) : (
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-full px-5 transition-smooth hover:border-primary/40 hover:text-primary active:scale-95"
        >
          <Link
            to="/"
            search={{ view: "today" }}
            data-ocid="tasks.empty.primary_button"
          >
            {e.action}
          </Link>
        </Button>
      )}
    </div>
  );
}
