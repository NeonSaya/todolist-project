import { Priority } from "@/types";

/** Theme-aware priority styling backed by the index.css status utilities. */
export const PRIORITY_STYLE: Record<
  Priority,
  { pill: string; dot: string; ring: string; active: string }
> = {
  [Priority.high]: {
    pill: "pill-priority-high",
    dot: "bg-priority-high",
    ring: "border-priority-high",
    active: "pill-priority-high",
  },
  [Priority.medium]: {
    pill: "pill-priority-medium",
    dot: "bg-priority-medium",
    ring: "border-priority-medium",
    active: "pill-priority-medium",
  },
  [Priority.low]: {
    pill: "pill-priority-low",
    dot: "bg-priority-low",
    ring: "border-priority-low",
    active: "pill-priority-low",
  },
};
