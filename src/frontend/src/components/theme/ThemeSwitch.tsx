import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_OPTIONS: {
  value: ThemeChoice;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "跟随系统", icon: Monitor },
];

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

export function useThemeChoice() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const choice: ThemeChoice = isThemeChoice(theme) ? theme : "system";
  return {
    choice,
    resolved: resolvedTheme === "dark" ? "dark" : "light",
    setChoice: (next: ThemeChoice) => setTheme(next),
  };
}

/** Segmented 浅色 / 深色 / 跟随系统 control for the desktop sidebar. */
export function ThemeSwitch({ ocid = "theme.switch" }: { ocid?: string }) {
  const { choice, setChoice } = useThemeChoice();
  return (
    <fieldset
      data-ocid={ocid}
      className="grid grid-cols-3 gap-0.5 rounded-full bg-secondary p-0.5 transition-theme"
    >
      <legend className="sr-only">界面主题</legend>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            title={label}
            data-ocid={`${ocid}.${value}.toggle`}
            onClick={() => setChoice(value)}
            className={`focus-ring inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-full px-1.5 text-[11px] font-medium transition-smooth active:scale-95 ${
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

/** Compact icon button with a theme menu, for the mobile header. */
export function ThemeMenuButton({ ocid = "theme.menu" }: { ocid?: string }) {
  const { choice, resolved, setChoice } = useThemeChoice();
  const current = THEME_OPTIONS.find((o) => o.value === choice);
  const TriggerIcon = resolved === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-ocid={`${ocid}.dropdown_menu`}
          aria-label={`切换主题，当前：${current?.label ?? "跟随系统"}`}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground active:scale-95"
        >
          <TriggerIcon className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-xl p-1.5 shadow-float"
      >
        <DropdownMenuLabel className="px-2 text-xs font-medium tracking-wider text-muted-foreground">
          界面主题
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={choice}
          onValueChange={(v) => {
            if (isThemeChoice(v)) setChoice(v);
          }}
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              data-ocid={`${ocid}.${value}.radio`}
              className="h-10 cursor-pointer gap-2 rounded-lg"
            >
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
