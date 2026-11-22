import { ThemeSwitch } from "@/components/theme/ThemeSwitch";
import { useAiConfig } from "@/lib/aiConfig";
import { TASK_VIEWS, VIEW_LABELS } from "@/lib/tasks";
import type { TaskView } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock, Settings2, Sparkles } from "lucide-react";
import { Brand } from "./Brand";
import { CountBadge, useNavState } from "./navState";
import { VIEW_ICONS } from "./viewIcons";

const navItem = (active: boolean) =>
  `focus-ring group relative flex h-10 items-center gap-3 rounded-lg pl-4 pr-2.5 text-sm transition-smooth active:scale-[0.98] ${
    active
      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
      : "font-medium text-sidebar-foreground hover:bg-secondary hover:text-foreground"
  }`;

function ActiveBar({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-smooth ${active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0"}`}
    />
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-2 text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export function Sidebar({ counts }: { counts: Record<TaskView, number> }) {
  const { activeView, onSmartAdd, onSettings } = useNavState();
  const { isConfigured } = useAiConfig();

  return (
    <aside
      data-ocid="nav.sidebar.panel"
      className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 transition-theme md:flex"
    >
      <div className="px-2">
        <Brand />
      </div>

      <nav aria-label="任务视图" className="mt-8 flex flex-col gap-0.5">
        <SectionLabel>视图</SectionLabel>
        {TASK_VIEWS.map((view) => {
          const Icon = VIEW_ICONS[view];
          const active = activeView === view;
          const iconTone = active
            ? "text-primary"
            : view === "overdue" && counts.overdue > 0
              ? "text-date-overdue"
              : "text-muted-foreground group-hover:text-foreground";
          return (
            <Link
              key={view}
              to="/"
              search={{ view }}
              data-ocid={`nav.view.${view}.link`}
              aria-current={active ? "page" : undefined}
              className={navItem(active)}
            >
              <ActiveBar active={active} />
              <Icon
                className={`h-4 w-4 shrink-0 transition-smooth ${iconTone}`}
                aria-hidden
              />
              <span className="truncate">{VIEW_LABELS[view]}</span>
              <CountBadge view={view} count={counts[view]} active={active} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-sidebar-border pt-5">
        <SectionLabel>AI 助手</SectionLabel>
        <Link
          to="/smart-add"
          data-ocid="nav.smart_add.link"
          aria-current={onSmartAdd ? "page" : undefined}
          className={`focus-ring ai-border group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-smooth hover:-translate-y-px hover:shadow-glow-ai active:scale-[0.98] ${onSmartAdd ? "shadow-glow-ai" : "shadow-xs"}`}
        >
          <span className="bg-gradient-aurora inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-accent-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-sm font-semibold text-foreground">
              智能添加
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              粘贴文字，AI 拆成任务
            </span>
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-accent opacity-50 transition-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </Link>

        <Link
          to="/settings"
          data-ocid="nav.settings.link"
          aria-current={onSettings ? "page" : undefined}
          className={`${navItem(onSettings)} mt-2`}
        >
          <ActiveBar active={onSettings} />
          <Settings2
            className={`h-4 w-4 shrink-0 transition-smooth ${onSettings ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
            aria-hidden
          />
          <span>AI 设置</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${isConfigured ? "bg-success" : "bg-warning"}`}
            />
            {isConfigured ? "已连接" : "未配置"}
          </span>
        </Link>
      </div>

      <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
        <ThemeSwitch ocid="nav.theme" />
        <p className="flex items-center gap-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          API Key 仅保存在本浏览器中
        </p>
      </div>
    </aside>
  );
}
