import { AddedBanner } from "@/components/smart-add/AddedBanner";
import { AiSetupPrompt } from "@/components/smart-add/AiSetupPrompt";
import { AnalyzingState } from "@/components/smart-add/AnalyzingState";
import { SmartAddComposer } from "@/components/smart-add/SmartAddComposer";
import { SuggestionReview } from "@/components/smart-add/SuggestionReview";
import {
  type EditableSuggestion,
  toEditable,
} from "@/components/smart-add/types";
import { useCreateTasks } from "@/hooks/useQueries";
import { analyzeText } from "@/lib/ai";
import { useAiConfig } from "@/lib/aiConfig";
import { todayString } from "@/lib/tasks";
import type { TaskFields } from "@/types";
import { Link } from "@tanstack/react-router";
import { Settings2, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function SmartAddPage() {
  const { config, isConfigured } = useAiConfig();
  const createTasks = useCreateTasks();
  const today = todayString();
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [suggestions, setSuggestions] = useState<EditableSuggestion[] | null>(
    null,
  );
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const requestRef = useRef(0);

  const handleAnalyze = async () => {
    if (analyzing || !text.trim()) return;
    setError(null);
    setAddedCount(null);
    if (!isConfigured) {
      setShowSetup(true);
      return;
    }
    setShowSetup(false);
    setAnalyzing(true);
    const requestId = ++requestRef.current;
    try {
      const result = await analyzeText(text, today, config);
      if (requestId !== requestRef.current) return;
      setSuggestions(toEditable(result));
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        err instanceof Error && err.message
          ? err.message
          : "AI 分析失败，请稍后重试",
      );
    } finally {
      if (requestId === requestRef.current) setAnalyzing(false);
    }
  };

  const updateItem = (id: string, patch: Partial<EditableSuggestion>) =>
    setSuggestions((prev) =>
      prev ? prev.map((s) => (s.id === id ? { ...s, ...patch } : s)) : prev,
    );

  const removeItem = (id: string) =>
    setSuggestions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));

  const toggleAll = (checked: boolean) =>
    setSuggestions((prev) =>
      prev ? prev.map((s) => ({ ...s, checked })) : prev,
    );

  const handleConfirm = () => {
    if (!suggestions || createTasks.isPending) return;
    const selected = suggestions.filter((s) => s.checked && s.title.trim());
    if (selected.length === 0) return;
    const payload: TaskFields[] = selected.map((s) => ({
      title: s.title.trim(),
      priority: s.priority,
      date: s.date,
      note: s.note?.trim() ? s.note.trim() : null,
    }));
    createTasks.mutate(payload, {
      onSuccess: () => {
        toast.success(`已添加 ${payload.length} 条任务`);
        setSuggestions(null);
        setAddedCount(payload.length);
      },
      onError: (err) => {
        toast.error(err.message || "添加失败，建议已保留，请重试");
      },
    });
  };

  return (
    <section data-ocid="smart_add.page" className="space-y-6 pb-10">
      <header className="animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-aurora inline-flex h-10 w-10 items-center justify-center rounded-xl text-accent-foreground shadow-glow-ai">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            <span className="text-gradient-aurora">智能添加</span>
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          粘贴聊天记录、会议纪要或随手想法，AI
          会拆成清晰的待办，并自动识别日期与优先级。确认无误后一键加入清单。
        </p>
      </header>

      {addedCount !== null && (
        <AddedBanner count={addedCount} onDismiss={() => setAddedCount(null)} />
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 px-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] text-secondary-foreground">
              1
            </span>
            粘贴内容
          </p>
          {isConfigured ? (
            <span
              data-ocid="smart_add.ai_status.success_state"
              className="pill-success ml-auto inline-flex min-w-0 max-w-[60%] items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                aria-hidden
              />
              <span className="truncate">AI 已连接 · {config.model}</span>
            </span>
          ) : (
            <Link
              to="/settings"
              data-ocid="smart_add.ai_status.link"
              className="pill-warning focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-smooth hover:opacity-80"
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden />
              AI 尚未配置 · 去设置
            </Link>
          )}
        </div>

        <SmartAddComposer
          text={text}
          onTextChange={(value) => {
            setText(value);
            if (error) setError(null);
          }}
          onAnalyze={() => void handleAnalyze()}
          analyzing={analyzing}
          error={error}
          onDismissError={() => setError(null)}
        />
      </div>

      {showSetup && !isConfigured && (
        <AiSetupPrompt onDismiss={() => setShowSetup(false)} />
      )}

      {analyzing ? (
        <AnalyzingState />
      ) : (
        suggestions && (
          <SuggestionReview
            items={suggestions}
            today={today}
            saving={createTasks.isPending}
            onChange={updateItem}
            onRemove={removeItem}
            onToggleAll={toggleAll}
            onConfirm={handleConfirm}
            onDiscard={() => setSuggestions(null)}
          />
        )
      )}
    </section>
  );
}
