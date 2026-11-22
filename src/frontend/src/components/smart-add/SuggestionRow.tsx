import { DateField } from "@/components/tasks/DateField";
import { PrioritySelect } from "@/components/tasks/PrioritySelect";
import { Checkbox } from "@/components/ui/checkbox";
import { PRIORITY_META } from "@/lib/tasks";
import { Trash2 } from "lucide-react";
import { useId } from "react";
import type { EditableSuggestion } from "./types";

interface SuggestionRowProps {
  item: EditableSuggestion;
  index: number;
  today: string;
  onChange: (patch: Partial<EditableSuggestion>) => void;
  onRemove: () => void;
}

/** One editable AI suggestion. `index` is 1-based for markers. */
export function SuggestionRow({
  item,
  index,
  today,
  onChange,
  onRemove,
}: SuggestionRowProps) {
  const titleId = useId();
  const noteId = useId();
  const ocid = `smart_add.suggestion.${index}`;
  const emptyTitle = item.title.trim().length === 0;
  const meta = PRIORITY_META[item.priority];

  return (
    <li
      data-ocid={`smart_add.suggestion.item.${index}`}
      className={`group relative overflow-hidden rounded-xl border border-border py-4 pl-5 pr-3 transition-theme animate-fade-up sm:pr-4 ${
        item.checked
          ? "bg-card shadow-card hover:shadow-elevated"
          : "bg-muted shadow-none"
      }`}
      style={{ animationDelay: `${Math.min(index - 1, 8) * 45}ms` }}
    >
      <span
        aria-hidden
        className={`absolute inset-y-3 left-0 w-1 rounded-r-full transition-smooth ${meta.dot} ${
          item.checked ? "opacity-100" : "opacity-30"
        }`}
      />
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1.5 pt-2.5">
          <Checkbox
            checked={item.checked}
            onCheckedChange={(v) => onChange({ checked: v === true })}
            aria-label={`选择第 ${index} 条：${item.title || "未命名任务"}`}
            data-ocid={`smart_add.suggestion.checkbox.${index}`}
            className="h-5 w-5 rounded-md"
          />
          <span className="tabular text-[11px] font-medium text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <label htmlFor={titleId} className="sr-only">
              任务标题
            </label>
            <input
              id={titleId}
              data-ocid={`smart_add.suggestion.input.${index}`}
              value={item.title}
              maxLength={200}
              onChange={(e) => onChange({ title: e.target.value })}
              aria-invalid={emptyTitle}
              placeholder="任务标题"
              className={`focus-ring h-10 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-base font-semibold transition-smooth placeholder:font-normal placeholder:text-muted-foreground hover:border-border focus:border-input focus:bg-background ${
                item.checked
                  ? "text-foreground"
                  : "text-muted-foreground line-through decoration-1"
              }`}
            />
            <span
              data-ocid={`smart_add.suggestion.status.${index}`}
              className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
                item.checked ? "pill-success" : "pill-date-neutral"
              }`}
            >
              {item.checked ? "将添加" : "已跳过"}
            </span>
          </div>
          {emptyTitle && item.checked && (
            <p
              data-ocid={`smart_add.suggestion.field_error.${index}`}
              className="px-2 text-xs font-medium text-destructive"
            >
              标题为空的任务不会被添加
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 px-1">
            <PrioritySelect
              value={item.priority}
              onChange={(priority) => onChange({ priority })}
              ocid={`${ocid}.priority`}
            />
            <DateField
              value={item.date}
              onChange={(date) => onChange({ date })}
              today={today}
              ocid={`${ocid}.date`}
            />
          </div>
          <label htmlFor={noteId} className="sr-only">
            备注
          </label>
          <textarea
            id={noteId}
            data-ocid={`smart_add.suggestion.textarea.${index}`}
            value={item.note ?? ""}
            maxLength={1000}
            rows={1}
            onChange={(e) => onChange({ note: e.target.value || null })}
            placeholder="添加备注（可选）"
            className="focus-ring block min-h-9 w-full resize-y rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm text-muted-foreground transition-smooth placeholder:text-muted-foreground hover:border-border focus:border-input focus:bg-background focus:text-foreground"
          />
        </div>
        <button
          type="button"
          aria-label={`移除第 ${index} 条建议`}
          title="移除这条建议"
          data-ocid={`smart_add.suggestion.delete_button.${index}`}
          onClick={onRemove}
          className="focus-ring mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive active:scale-95"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
