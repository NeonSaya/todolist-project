import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleCheckBig, X } from "lucide-react";

interface AddedBannerProps {
  count: number;
  onDismiss: () => void;
}

/** Success panel after suggestions were saved, linking back to the list. */
export function AddedBanner({ count, onDismiss }: AddedBannerProps) {
  return (
    <div
      aria-live="polite"
      data-ocid="smart_add.success_state"
      className="surface-card flex flex-wrap items-center gap-3 border-primary/30 px-5 py-4 animate-scale-in"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <CircleCheckBig className="h-5 w-5 animate-check-pop" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          已添加 <span className="tabular">{count}</span> 条任务
        </p>
        <p className="text-xs text-muted-foreground">
          它们已经进入你的清单，可以继续粘贴下一段内容。
        </p>
      </div>
      <Link
        to="/"
        search={{ view: "all" }}
        data-ocid="smart_add.tasks.link"
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-smooth hover:shadow-subtle active:scale-95"
      >
        查看任务清单
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      <button
        type="button"
        aria-label="关闭提示"
        data-ocid="smart_add.success.close_button"
        onClick={onDismiss}
        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
