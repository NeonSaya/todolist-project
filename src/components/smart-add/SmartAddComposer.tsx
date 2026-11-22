import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Sparkles, X } from "lucide-react";
import { type FormEvent, useId } from "react";

const MAX_LENGTH = 12000;

interface SmartAddComposerProps {
  text: string;
  onTextChange: (value: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  error: string | null;
  onDismissError: () => void;
}

/** Large paste area plus the 分析 trigger. */
export function SmartAddComposer({
  text,
  onTextChange,
  onAnalyze,
  analyzing,
  error,
  onDismissError,
}: SmartAddComposerProps) {
  const textareaId = useId();
  const hintId = useId();
  const empty = text.trim().length === 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="smart_add.composer.panel"
      className="ai-border relative overflow-hidden rounded-2xl shadow-card transition-smooth focus-within:shadow-glow-ai"
    >
      <div
        className="bg-gradient-aurora pointer-events-none absolute -top-24 right-0 h-48 w-2/3 animate-aurora rounded-full opacity-[0.12] blur-3xl"
        aria-hidden
      />
      <label htmlFor={textareaId} className="sr-only">
        要整理的文字
      </label>
      <textarea
        id={textareaId}
        data-ocid="smart_add.textarea"
        aria-describedby={hintId}
        value={text}
        maxLength={MAX_LENGTH}
        disabled={analyzing}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onAnalyze();
          }
        }}
        placeholder={
          "粘贴聊天记录、会议纪要或随手想法，例如：\n\n“明天下午三点前把季度复盘 PPT 发给王总，周五记得交房租，下周三和设计团队过一遍新版首页。”"
        }
        className="relative block min-h-[240px] w-full resize-y bg-transparent px-5 pb-3 pt-5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-70 md:min-h-[280px]"
      />
      <div className="relative flex flex-wrap items-center gap-3 border-t border-border px-4 py-3">
        <p id={hintId} className="text-xs text-muted-foreground">
          <span className="tabular">{text.length.toLocaleString()}</span> /{" "}
          <span className="tabular">{MAX_LENGTH.toLocaleString()}</span> 字
          <span className="ml-2 hidden sm:inline">
            · Ctrl / ⌘ + Enter 快速分析
          </span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          {!empty && !analyzing && (
            <Button
              type="button"
              variant="ghost"
              data-ocid="smart_add.clear_button"
              onClick={() => onTextChange("")}
              className="h-10 rounded-full px-4 text-muted-foreground transition-smooth hover:text-foreground"
            >
              清空
            </Button>
          )}
          <Button
            type="submit"
            data-ocid="smart_add.analyze.primary_button"
            disabled={analyzing || empty}
            title={empty ? "请先粘贴或输入内容" : undefined}
            className="bg-gradient-aurora h-10 rounded-full px-6 font-semibold text-accent-foreground shadow-glow-ai transition-smooth hover:-translate-y-px hover:shadow-elevated active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {analyzing ? "分析中…" : "分析"}
          </Button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          data-ocid="smart_add.error_state"
          className="relative flex items-start gap-2.5 border-t border-border bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-up"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">分析没有成功</p>
            <p className="mt-0.5 break-words text-destructive/90">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              你粘贴的内容已保留，可以直接重试。
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭错误提示"
            data-ocid="smart_add.error.close_button"
            onClick={onDismissError}
            className="focus-ring inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-smooth hover:bg-destructive/15"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}
    </form>
  );
}
