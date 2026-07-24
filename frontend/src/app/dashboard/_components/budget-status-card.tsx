"use client";

import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllBudgetsAction } from "@/actions/budget/actions";
import { BudgetCategoryProgressRow } from "@/components/budget/budget-category-progress-row";
import { getBudgetProgressBarClass } from "@/lib/budget-status";
import { formatCurrency } from "@/lib/helper";
import type { Budget } from "@/types/budget";

/**
 * Dashboard widget summarizing aggregate and per-category budget usage.
 */
export function BudgetStatusCard() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllBudgetsAction();
      setBudgets(result.budgets ?? []);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const totals = useMemo(() => {
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
    const percentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    return { totalSpent, totalLimit, percentUsed };
  }, [budgets]);

  const overallBarClass = getBudgetProgressBarClass(totals.percentUsed);
  const overallClamped = Math.min(Math.max(totals.percentUsed, 0), 100);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Budget Status</h2>
        <Link
          href="/dashboard/budget"
          className="shrink-0 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12 text-zinc-500">
          <IconLoader2 size={22} className="animate-spin text-green-500" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-zinc-500">No budgets yet</p>
          <Link
            href="/dashboard/budget"
            className="text-sm font-medium text-green-400 hover:text-green-300"
          >
            Create a budget →
          </Link>
        </div>
      ) : (
        <>
          {/* Aggregate usage: "$X used of $Y total" + "XX% used" */}
          <div className="mb-2 flex items-end justify-between gap-3">
            <p className="text-sm text-zinc-300">
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totals.totalSpent, true)}
              </p>{" "}
              <p className="text-zinc-500">
                used of {formatCurrency(totals.totalLimit, true)} total
              </p>
            </p>
            <p className="pb-1 shrink-0 text-sm font-medium text-green-400">
              <p>{Math.round(totals.percentUsed)}%</p>
              <p> used</p>
            </p>
          </div>

          <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${overallBarClass}`}
              style={{ width: `${overallClamped}%` }}
            />
          </div>

          {/* Per-category breakdown */}
          <div className="space-y-4">
            {budgets.slice(0, 5).map((budget) => (
              <BudgetCategoryProgressRow
                key={budget.id}
                categoryName={budget.category.name}
                spent={budget.spent}
                limit={budget.amount}
                percentUsed={budget.percentUsed}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
