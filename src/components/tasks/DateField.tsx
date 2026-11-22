import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDays,
  datePillClass,
  formatDateChip,
  formatDayHeading,
  parseLocalDate,
} from "@/lib/tasks";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useId, useState } from "react";

interface DateFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  today: string;
  ocid: string;
}

/** Date chip that opens quick choices plus a precise date input. */
export function DateField({ value, onChange, today, ocid }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const choices: { label: string; hint: string; value: string | null }[] = [
    { label: "今天", hint: today.slice(5), value: today },
    {
      label: "明天",
      hint: addDays(today, 1).slice(5),
      value: addDays(today, 1),
    },
    {
      label: "一周后",
      hint: addDays(today, 7).slice(5),
      value: addDays(today, 7),
    },
    { label: "无日期", hint: "随时", value: null },
  ];

  const pick = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };
  const validDraft = draft === "" || parseLocalDate(draft) !== null;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid={`${ocid}.open_modal_button`}
          aria-label={`日期：${value ? formatDayHeading(value) : "无日期"}`}
          className={`focus-ring inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-smooth hover:shadow-xs active:scale-95 ${
            value
              ? datePillClass(value, today)
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular">
            {value ? formatDateChip(value, today) : "无日期"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-ocid={`${ocid}.popover`}
        align="end"
        className="w-64 rounded-2xl border-border p-3 shadow-float"
      >
        <p className="px-1 pb-2 text-xs font-medium tracking-wider text-muted-foreground">
          快速选择
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {choices.map((c) => {
            const active = c.value === value;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => pick(c.value)}
                className={`focus-ring flex h-12 flex-col items-start justify-center rounded-xl px-3 text-left transition-smooth active:scale-[0.98] ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-foreground hover:bg-muted hover:shadow-xs"
                }`}
              >
                <span className="text-sm font-semibold">{c.label}</span>
                <span
                  className={`tabular font-mono text-[11px] ${active ? "opacity-80" : "text-muted-foreground"}`}
                >
                  {c.hint}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          <label
            htmlFor={inputId}
            className="block px-1 text-xs font-medium tracking-wider text-muted-foreground"
          >
            选择具体日期
          </label>
          <input
            id={inputId}
            type="date"
            data-ocid={`${ocid}.input`}
            min="0001-01-01"
            max="9999-12-31"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (validDraft) pick(draft || null);
            }}
            className="focus-ring tabular h-10 w-full rounded-xl border border-input bg-card px-3 font-mono text-sm text-foreground transition-smooth"
          />
          <button
            type="button"
            disabled={!validDraft}
            onClick={() => pick(draft || null)}
            className="focus-ring min-h-8 w-full rounded-lg bg-secondary px-3 text-xs font-medium text-foreground transition-smooth hover:bg-muted disabled:opacity-50"
          >
            应用日期
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
