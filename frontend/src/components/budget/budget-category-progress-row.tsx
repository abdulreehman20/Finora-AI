"use client";

import { getBudgetProgressBarClass } from "@/lib/budget-status";
import { formatCurrency } from "@/lib/helper";

interface BudgetCategoryProgressRowProps {
  /** Category display name */
  categoryName: string;
  /** Amount spent in dollars */
  spent: number;
  /** Budget limit in dollars */
  limit: number;
  /** Usage percentage (0–100+) */
  percentUsed: number;
}

/**
 * Shared per-category budget progress row used on the dashboard
 * Budget Status card (and any compact spent/limit breakdown).
 */
export function BudgetCategoryProgressRow({
  categoryName,
  spent,
  limit,
  percentUsed,
}: BudgetCategoryProgressRowProps) {
  const clamped = Math.min(Math.max(percentUsed, 0), 100);
  const barClass = getBudgetProgressBarClass(percentUsed);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium text-zinc-200">{categoryName}</span>
        <span className="shrink-0 text-zinc-400">
          {formatCurrency(spent, true)} / {formatCurrency(limit, true)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
