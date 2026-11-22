import { AiConfigForm } from "@/components/settings/AiConfigForm";
import { useAiConfig } from "@/lib/aiConfig";
import { ShieldCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export default function SettingsPage() {
  const { config, isConfigured } = useAiConfig();
  const reduce = useReducedMotion();

  return (
    <motion.section
      data-ocid="settings.page"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <header>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          AI 设置
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          连接你自己的 OpenAI 兼容服务，拾序会用它把粘贴的文字整理成任务。
        </p>
        <p
          data-ocid="settings.local_storage.badge"
          className="pill-success mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          所有配置仅保存在本机
        </p>
      </header>

      <div
        data-ocid="settings.status.card"
        className="ai-border flex items-center gap-4 rounded-2xl p-5 shadow-card"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-aurora text-primary-foreground shadow-glow-ai">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={
                isConfigured
                  ? "h-2 w-2 rounded-full bg-success"
                  : "h-2 w-2 rounded-full bg-warning"
              }
              aria-hidden
            />
            <p className="text-sm font-medium text-foreground">
              {isConfigured ? "智能添加已就绪" : "尚未配置 API Key"}
            </p>
          </div>
          <p className="tabular mt-1 truncate font-mono text-xs text-muted-foreground">
            {config.baseUrl} · {config.model}
          </p>
        </div>
      </div>

      <AiConfigForm />
    </motion.section>
  );
}
