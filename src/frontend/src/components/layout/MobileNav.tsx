import { ThemeMenuButton } from "@/components/theme/ThemeSwitch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VIEW_LABELS } from "@/lib/tasks";
import type { TaskView } from "@/types";
import { Link } from "@tanstack/react-router";
import { Ellipsis, Settings2, Sparkles } from "lucide-react";
import { Brand } from "./Brand";
import { useNavState } from "./navState";
import { VIEW_ICONS } from "./viewIcons";

const SHORT_LABELS: Record<TaskView, string> = {
  today: "今天",
  upcoming: "即将",
  overdue: "逾期",
  all: "全部",
  completed: "已完成",
};

const tabBase =
  "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition-smooth active:scale-95";

const tile = (active: boolean) =>
  `relative inline-flex h-7 w-12 items-center justify-center rounded-full transition-smooth ${active ? "bg-sidebar-accent" : ""}`;

export function MobileHeader() {
  const { onSettings } = useNavState();
  return (
    <header className="surface-bar sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border px-4 transition-theme md:hidden">
      <Brand compact />
      <div className="flex items-center gap-0.5">
        <ThemeMenuButton ocid="nav.theme_mobile" />
        <Link
          to="/settings"
          data-ocid="nav.settings_mobile.link"
          aria-label="AI 设置"
          aria-current={onSettings ? "page" : undefined}
          className={`focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl transition-smooth hover:bg-secondary hover:text-foreground active:scale-95 ${onSettings ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"}`}
        >
          <Settings2 className="h-[18px] w-[18px]" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

function TabLink({ view, count }: { view: TaskView; count: number }) {
  const { activeView } = useNavState();
  const Icon = VIEW_ICONS[view];
  const active = activeView === view;
  const badge =
    view === "overdue"
      ? "pill-date-overdue"
      : active
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-secondary-foreground";
  return (
    <Link
      to="/"
      search={{ view }}
      data-ocid={`nav.tab.${view}.link`}
      aria-current={active ? "page" : undefined}
      aria-label={count > 0 ? `${VIEW_LABELS[view]}，${count} 项` : undefined}
      className={`${tabBase} ${active ? "font-semibold text-sidebar-accent-foreground" : "font-medium text-muted-foreground"}`}
    >
      <span className={tile(active)}>
        <Icon
          className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`}
          aria-hidden
        />
        {count > 0 && (
          <span
            aria-hidden
            className={`tabular absolute -right-1 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold ring-2 ring-background ${badge}`}
          >
            {count}
          </span>
        )}
      </span>
      {SHORT_LABELS[view]}
    </Link>
  );
}

export function MobileBottomNav({
  counts,
}: { counts: Record<TaskView, number> }) {
  const { activeView, onSmartAdd, onSettings } = useNavState();
  const moreActive =
    activeView === "all" || activeView === "completed" || onSettings;
  const moreItems: TaskView[] = ["all", "completed"];

  return (
    <nav
      aria-label="主导航"
      data-ocid="nav.bottom.panel"
      className="surface-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end border-t border-border px-1 pb-[env(safe-area-inset-bottom)] shadow-float transition-theme md:hidden"
    >
      <TabLink view="today" count={counts.today} />
      <TabLink view="upcoming" count={counts.upcoming} />

      <Link
        to="/smart-add"
        data-ocid="nav.tab.smart_add.link"
        aria-current={onSmartAdd ? "page" : undefined}
        className="focus-ring flex min-h-14 flex-col items-center justify-end gap-1 rounded-xl pb-1.5 text-[11px] font-semibold transition-smooth active:scale-95"
      >
        <span
          className={`bg-gradient-aurora -mt-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-accent-foreground ring-4 ring-background transition-smooth ${onSmartAdd ? "shadow-glow-ai" : "shadow-elevated"}`}
        >
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className={onSmartAdd ? "text-accent" : "text-foreground"}>
          智能添加
        </span>
      </Link>

      <TabLink view="overdue" count={counts.overdue} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-ocid="nav.tab.more.dropdown_menu"
            className={`${tabBase} ${moreActive ? "font-semibold text-sidebar-accent-foreground" : "font-medium text-muted-foreground"}`}
          >
            <span className={tile(moreActive)}>
              <Ellipsis
                className={`h-[18px] w-[18px] ${moreActive ? "text-primary" : ""}`}
                aria-hidden
              />
            </span>
            更多
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={10}
          className="w-48 rounded-xl p-1.5 shadow-float"
        >
          {moreItems.map((view) => {
            const Icon = VIEW_ICONS[view];
            const active = activeView === view;
            return (
              <DropdownMenuItem key={view} asChild>
                <Link
                  to="/"
                  search={{ view }}
                  data-ocid={`nav.more.${view}.link`}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 ${active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                    aria-hidden
                  />
                  <span>{VIEW_LABELS[view]}</span>
                  {counts[view] > 0 && view !== "completed" && (
                    <span className="tabular ml-auto font-mono text-xs text-muted-foreground">
                      {counts[view]}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem asChild>
            <Link
              to="/settings"
              data-ocid="nav.more.settings.link"
              aria-current={onSettings ? "page" : undefined}
              className={`flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 ${onSettings ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : ""}`}
            >
              <Settings2 className="h-4 w-4 text-accent" aria-hidden />
              <span>AI 设置</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
