import { Sparkles } from "lucide-react";

const ROWS = ["analyzing-1", "analyzing-2", "analyzing-3"];

/** Aurora shimmer shown while the model reads the pasted text. */
export function AnalyzingState() {
  return (
    <section
      data-ocid="smart_add.loading_state"
      aria-live="polite"
      aria-busy="true"
      className="surface-glass overflow-hidden p-5 animate-scale-in"
    >
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-10 w-10 items-center justify-center">
          <span
            className="bg-gradient-aurora absolute inset-0 animate-glow-pulse rounded-xl blur-md"
            aria-hidden
          />
          <span className="bg-gradient-aurora relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-accent-foreground shadow-glow-ai">
            <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
          </span>
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            <span className="text-gradient-aurora">AI 正在阅读并拆分任务</span>
          </p>
          <p className="text-xs text-muted-foreground">
            识别待办、换算日期、判断轻重缓急，通常需要几秒钟…
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5">
        {ROWS.map((id, i) => (
          <li
            key={id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <span className="h-4 w-4 shrink-0 rounded bg-muted" />
            <span
              className="h-3.5 flex-1 animate-shimmer rounded-full bg-gradient-to-r from-muted via-accent/25 to-muted bg-[length:200%_100%]"
              style={{ maxWidth: `${72 - i * 14}%` }}
            />
            <span className="ml-auto h-6 w-14 shrink-0 rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    </section>
  );
}
