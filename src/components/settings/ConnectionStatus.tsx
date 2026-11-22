import type { ConnectionResult } from "@/lib/ai";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface ConnectionStatusProps {
  testing: boolean;
  result: ConnectionResult | null;
}

export function ConnectionStatus({ testing, result }: ConnectionStatusProps) {
  const reduce = useReducedMotion();
  if (testing) {
    return (
      <div
        data-ocid="settings.test.loading_state"
        aria-live="polite"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-4 text-sm text-muted-foreground transition-theme"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-foreground">正在测试连接…</p>
          <p className="mt-0.5 text-xs">请求已发出，最长约 20 秒</p>
        </div>
      </div>
    );
  }
  if (!result) return null;

  const ok = result.ok;

  return (
    <motion.div
      key={ok ? "ok" : result.message}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      data-ocid={
        ok ? "settings.test.success_state" : "settings.test.error_state"
      }
      className={
        ok
          ? "bg-success-soft mt-6 flex items-start gap-3 rounded-2xl border border-success/30 px-4 py-4 transition-theme"
          : "mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 transition-theme"
      }
    >
      <span
        className={
          ok
            ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground shadow-xs"
            : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-xs"
        }
      >
        {ok ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5" aria-hidden />
        )}
      </span>
      <div className="min-w-0 text-sm">
        <p
          className={
            ok
              ? "text-base font-semibold text-success"
              : "text-base font-semibold text-destructive"
          }
        >
          {ok ? "连接成功" : "连接失败"}
        </p>
        <p className="mt-1 break-words leading-relaxed text-foreground">
          {ok ? (
            <>
              模型{" "}
              <span className="pill-success rounded-md px-1.5 py-0.5 font-mono text-xs">
                {result.model}
              </span>{" "}
              已正常响应，可以开始使用智能添加。
            </>
          ) : (
            result.message
          )}
        </p>
        {!ok && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            请检查接口地址、Key 与模型名称后重试。
          </p>
        )}
      </div>
    </motion.div>
  );
}
