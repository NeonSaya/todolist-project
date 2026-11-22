import { Button } from "@/components/ui/button";
import { useSetTaskCompleted } from "@/hooks/useQueries";
import {
  PRIORITY_META,
  datePillClass,
  formatDateChip,
  spotlightTask,
  todayProgress,
  viewCounts,
} from "@/lib/tasks";
import type { Task } from "@/types";
import { Check, Crosshair, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PRIORITY_STYLE } from "./priorityStyles";

interface TodayOverviewProps {
  tasks: Task[];
  today: string;
  onEdit: (task: Task) => void;
}

const RADIUS = 27;
const CIRC = 2 * Math.PI * RADIUS;

function ProgressRing({ percent, done }: { percent: number; done: boolean }) {
  return (
    <div
      className="relative h-[72px] w-[72px] shrink-0 md:h-20 md:w-20"
      role="img"
      aria-label={`今日完成进度 ${percent}%`}
      data-ocid="tasks.overview.progress"
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <title>今日完成进度</title>
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          className="stroke-secondary"
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - percent / 100)}
          className={`${done ? "stroke-success" : "stroke-primary"} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={`tabular font-display text-base font-bold md:text-lg ${done ? "text-success" : "text-foreground"}`}
        >
          {percent}
          <span className="text-[10px] font-semibold text-muted-foreground">
            %
          </span>
        </span>
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
  ocid,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: string;
  ocid: string;
}) {
  return (
    <div data-ocid={ocid} className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-1">
        <span
          className={`tabular font-display text-3xl font-bold leading-none tracking-tight md:text-[2.25rem] ${tone}`}
        >
          {value}
        </span>
        {sub && (
          <span className="tabular text-sm font-medium text-muted-foreground">
            {sub}
          </span>
        )}
      </dd>
    </div>
  );
}

export function TodayOverview({ tasks, today, onEdit }: TodayOverviewProps) {
  const progress = todayProgress(tasks, today);
  const counts = viewCounts(tasks, today);
  const spotlight = spotlightTask(tasks, today);
  const setCompleted = useSetTaskCompleted();
  const allDone = progress.total > 0 && progress.completed === progress.total;

  const summary =
    progress.total === 0
      ? "今天还没有安排任务"
      : allDone
        ? "今天的任务全部完成，做得好"
        : `还剩 ${progress.total - progress.completed} 项，继续保持`;

  return (
    <section
      data-ocid="tasks.overview.card"
      aria-label="今日概览"
      className="surface-glass transition-theme overflow-hidden motion-safe:animate-fade-up"
    >
      <div className="flex items-center gap-4 px-5 py-5 md:gap-6 md:px-6">
        <dl className="grid min-w-0 flex-1 grid-cols-3 gap-3 md:gap-6">
          <Stat
            label="今日剩余"
            value={counts.today}
            tone="text-foreground"
            ocid="tasks.overview.pending"
          />
          <Stat
            label="已完成"
            value={progress.completed}
            sub={`/ ${progress.total}`}
            tone="text-success"
            ocid="tasks.overview.completed"
          />
          <Stat
            label="逾期"
            value={counts.overdue}
            tone={
              counts.overdue > 0 ? "text-date-overdue" : "text-muted-foreground"
            }
            ocid="tasks.overview.overdue"
          />
        </dl>
        <div className="flex shrink-0 items-center gap-3 border-l border-border pl-4 md:pl-6">
          <ProgressRing percent={progress.percent} done={allDone} />
          <p className="hidden max-w-[8.5rem] text-xs leading-relaxed text-muted-foreground lg:block">
            {allDone && (
              <Sparkles
                className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-success"
                aria-hidden
              />
            )}
            {summary}
          </p>
        </div>
      </div>

      {spotlight ? (
        <div
          data-ocid="tasks.spotlight.card"
          className="flex items-center gap-3 border-t border-border bg-card px-5 py-3 transition-theme md:px-6"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl pill-date-today">
            <Crosshair className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span>当前焦点</span>
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${PRIORITY_STYLE[spotlight.priority].pill}`}
              >
                {PRIORITY_META[spotlight.priority].label}优先
              </span>
              {spotlight.date && (
                <span
                  className={`tabular rounded-full px-1.5 py-px text-[10px] font-semibold ${datePillClass(spotlight.date, today)}`}
                >
                  {spotlight.date < today && "逾期 · "}
                  {formatDateChip(spotlight.date, today)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onEdit(spotlight)}
              data-ocid="tasks.spotlight.edit_button"
              className="focus-ring mt-0.5 block max-w-full truncate rounded text-left text-[15px] font-semibold text-foreground transition-smooth hover:text-primary"
            >
              {spotlight.title}
            </button>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="tasks.spotlight.complete_button"
            disabled={setCompleted.isPending}
            onClick={() =>
              setCompleted.mutate(
                { id: spotlight.id, completed: true },
                {
                  onSuccess: () => toast.success("完成一项重点任务"),
                  onError: (err) =>
                    toast.error("更新失败", {
                      description: err.message || "请稍后重试",
                    }),
                },
              )
            }
            className="h-9 shrink-0 rounded-full px-3.5 text-primary transition-smooth hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
          >
            <Check className="h-4 w-4" aria-hidden />
            完成
          </Button>
        </div>
      ) : (
        <p
          data-ocid="tasks.spotlight.empty_state"
          className="flex items-center gap-2 border-t border-border bg-card px-5 py-3 text-xs text-muted-foreground transition-theme md:px-6"
        >
          <Check className="h-3.5 w-3.5 text-success" aria-hidden />
          暂无紧迫的重点任务，可以从容安排接下来的事。
        </p>
      )}
    </section>
  );
}
