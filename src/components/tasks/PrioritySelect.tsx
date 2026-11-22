import { PRIORITY_META, PRIORITY_ORDER } from "@/lib/tasks";
import type { Priority } from "@/types";
import { PRIORITY_STYLE } from "./priorityStyles";

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
  ocid: string;
  label?: string;
}

/** Segmented 高 / 中 / 低 priority picker. */
export function PrioritySelect({
  value,
  onChange,
  ocid,
  label = "优先级",
}: PrioritySelectProps) {
  return (
    <fieldset
      data-ocid={ocid}
      className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-0.5 transition-theme"
    >
      <legend className="sr-only">{label}</legend>
      {PRIORITY_ORDER.map((p) => {
        const meta = PRIORITY_META[p];
        const style = PRIORITY_STYLE[p];
        const active = p === value;
        return (
          <button
            key={p}
            type="button"
            aria-pressed={active}
            aria-label={`${meta.label}优先级`}
            data-ocid={`${ocid}.${p}.toggle`}
            onClick={() => onChange(p)}
            className={`focus-ring inline-flex h-8 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-smooth active:scale-95 ${
              active
                ? style.active
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-smooth ${style.dot} ${
                active ? "opacity-100" : "opacity-60"
              }`}
              aria-hidden
            />
            {meta.label}
          </button>
        );
      })}
    </fieldset>
  );
}
