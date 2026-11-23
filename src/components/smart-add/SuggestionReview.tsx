import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCheck, ListPlus, Loader2, X } from "lucide-react";
import { SuggestionRow } from "./SuggestionRow";
import type { EditableSuggestion } from "./types";

interface SuggestionReviewProps {
  items: EditableSuggestion[];
  today: string;
  saving: boolean;
  onChange: (id: string, patch: Partial<EditableSuggestion>) => void;
  onRemove: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onConfirm: () => void;
  onDiscard: () => void;
}

/** Editable list of AI suggestions with select-all and bulk confirm. */
export function SuggestionReview({
  items,
  today,
  saving,
  onChange,
  onRemove,
  onToggleAll,
  onConfirm,
  onDiscard,
}: SuggestionReviewProps) {
  const checkedCount = items.filter((i) => i.checked).length;
  const addable = items.filter((i) => i.checked && i.title.trim()).length;
  const allChecked = checkedCount === items.length && items.length > 0;
  const someChecked = checkedCount > 0 && !allChecked;

  return (
    <section
      data-ocid="smart_add.suggestions.section"
      aria-labelledby="smart-add-review-heading"
      className="space-y-3 animate-fade-up"
    >
      <p className="flex items-center gap-2 px-1 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
          2
        </span>
        确认建议 · 勾选要保留的任务，可直接修改标题、优先级与日期
      </p>
      <div className="surface-glass sticky top-3 z-10 flex flex-wrap items-center gap-3 px-4 py-3 transition-theme">
        <label
          htmlFor="smart-add-select-all"
          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
        >
          <Checkbox
            id="smart-add-select-all"
            checked={allChecked ? true : someChecked ? "indeterminate" : false}
            onCheckedChange={() => onToggleAll(!allChecked)}
            data-ocid="smart_add.select_all.checkbox"
            className="h-5 w-5 rounded-md"
          />
          全选
        </label>
        <div className="min-w-0">
          <h2
            id="smart-add-review-heading"
            className="text-sm font-semibold text-foreground"
          >
            AI 找到 <span className="tabular">{items.length}</span> 条任务
          </h2>
          <p
            className="text-xs text-muted-foreground"
            data-ocid="smart_add.checked_count"
          >
            已选{" "}
            <span className="tabular font-semibold text-primary">
              {checkedCount}
            </span>{" "}
            / <span className="tabular">{items.length}</span> 条
            {items.length - checkedCount > 0 && (
              <> · 跳过 {items.length - checkedCount} 条</>
            )}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            data-ocid="smart_add.discard.secondary_button"
            onClick={onDiscard}
            disabled={saving}
            title="丢弃全部建议，粘贴的内容会保留"
            className="h-10 rounded-lg px-4 text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" aria-hidden />
            放弃
          </Button>
          <Button
            type="button"
            data-ocid="smart_add.confirm_button"
            onClick={onConfirm}
            disabled={saving || addable === 0}
            title={addable === 0 ? "请至少勾选一条有标题的任务" : undefined}
            className="h-10 rounded-xl px-5 font-semibold shadow-xs transition-smooth hover:shadow-subtle active:scale-95"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ListPlus className="h-4 w-4" aria-hidden />
            )}
            {saving ? "添加中…" : `添加 ${addable} 条任务`}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          data-ocid="smart_add.suggestions.empty_state"
          className="surface-card flex flex-col items-center gap-3 px-6 py-12 text-center"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <CheckCheck className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">
            没有可添加的任务
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            这段内容里似乎没有明确的待办，或你已移除全部建议。试着补充一些细节后重新分析。
          </p>
        </div>
      ) : (
        <ul className="space-y-3" data-ocid="smart_add.suggestions.list">
          {items.map((item, i) => (
            <SuggestionRow
              key={item.id}
              item={item}
              index={i + 1}
              today={today}
              onChange={(patch) => onChange(item.id, patch)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
