import type { BudgetStatusTag } from "@/types/budget";

/**
 * Derives the status tag from percent used.
 * Thresholds match the backend analyze tagging rules.
 */
export function resolveBudgetStatusTag(percentUsed: number): BudgetStatusTag {
  if (percentUsed >= 90) return "Over Budget";
  if (percentUsed >= 70) return "Watch It";
  return "On Track";
}

/** Tailwind fill class for a budget progress bar based on usage. */
export function getBudgetProgressBarClass(percentUsed: number): string {
  const tag = resolveBudgetStatusTag(percentUsed);
  switch (tag) {
    case "On Track":
      return "bg-emerald-500";
    case "Watch It":
      return "bg-amber-500";
    case "Over Budget":
      return "bg-red-500";
    default: {
      const _exhaustive: never = tag;
      return _exhaustive;
    }
  }
}

/** Text color class for a budget status tag label. */
export function getBudgetStatusTextClass(tag: BudgetStatusTag): string {
  switch (tag) {
    case "On Track":
      return "text-emerald-400";
    case "Watch It":
      return "text-amber-400";
    case "Over Budget":
      return "text-red-400";
    default: {
      const _exhaustive: never = tag;
      return _exhaustive;
    }
  }
}
