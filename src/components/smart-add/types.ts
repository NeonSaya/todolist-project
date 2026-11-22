import type { AiSuggestion } from "@/lib/ai";

/** An AI suggestion being reviewed on the 智能添加 page. */
export interface EditableSuggestion extends AiSuggestion {
  id: string;
  checked: boolean;
}

export function toEditable(items: AiSuggestion[]): EditableSuggestion[] {
  return items.map((item, index) => ({
    ...item,
    id: `${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    checked: true,
  }));
}
