import { Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, X } from "lucide-react";

interface AiSetupPromptProps {
  onDismiss: () => void;
}

/** Friendly card shown when 分析 is pressed before AI is configured. */
export function AiSetupPrompt({ onDismiss }: AiSetupPromptProps) {
  return (
    <section
      data-ocid="smart_add.setup.card"
      className="ai-border relative overflow-hidden rounded-2xl p-6 shadow-glow-ai animate-scale-in"
    >
      <button
        type="button"
        aria-label="关闭提示"
        data-ocid="smart_add.setup.close_button"
        onClick={onDismiss}
        className="focus-ring absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">
            还差一步：连接你的 AI 服务
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            智能添加使用你自己的接口地址、API Key 与模型。Key
            只保存在本浏览器中，配置好后回到这里即可一键分析，你的内容不会丢失。
          </p>
        </div>
        <Link
          to="/settings"
          data-ocid="smart_add.setup.primary_button"
          className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-smooth hover:shadow-subtle active:scale-95 sm:self-center"
        >
          前往 AI 设置
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
