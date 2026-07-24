"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { getCategoryIcon } from "@/lib/category-icons";
import {
  getBudgetProgressBarClass,
  getBudgetStatusTextClass,
  resolveBudgetStatusTag,
} from "@/lib/budget-status";
import { formatCurrency } from "@/lib/helper";
import type { Budget, BudgetStatusTag } from "@/types/budget";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const DEFAULT_ANALYSIS_PLACEHOLDER =
  "Click Analyze to generate an AI spending insight for this budget.";

/** Returns the status icon component for a given tag. */
function getStatusIcon(tag: BudgetStatusTag) {
  switch (tag) {
    case "On Track":
      return IconCircleCheck;
    case "Watch It":
      return IconAlertTriangle;
    case "Over Budget":
      return IconAlertCircle;
    default: {
      const _exhaustive: never = tag;
      return _exhaustive;
    }
  }
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const Icon = getCategoryIcon(budget.category.icon);
  const percentUsed = Math.min(Math.max(budget.percentUsed, 0), 100);
  const tag = resolveBudgetStatusTag(budget.percentUsed);
  const StatusIcon = getStatusIcon(tag);
  const periodLabel = budget.period === "WEEKLY" ? "Weekly" : "Monthly";
  const description = budget.aiAnalysis ?? DEFAULT_ANALYSIS_PLACEHOLDER;

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] p-5 transition-colors hover:border-white/15">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${budget.category.color}22`,
              color: budget.category.color,
            }}
          >
            <Icon size={18} />
          </div>
          <span className="truncate text-sm font-semibold text-white">
            {budget.category.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
            aria-label={`Edit ${budget.category.name} budget`}
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            aria-label={`Delete ${budget.category.name} budget`}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">
          {formatCurrency(budget.spent, true)}
        </span>
        <span className="pb-0.5 text-sm text-zinc-500">
          of {formatCurrency(budget.amount, true)}
        </span>
      </div>

      {/* Shared progress coloring with dashboard Budget Status rows */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${getBudgetProgressBarClass(budget.percentUsed)}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          {periodLabel} · {Math.round(budget.percentUsed)}% Used
        </span>
        <span>
          {formatCurrency(Math.max(budget.remaining, 0), true)} left
        </span>
      </div>

      <Separator className="mb-4 bg-white/10" />

      <div className="space-y-2">
        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${getBudgetStatusTextClass(tag)}`}
        >
          <StatusIcon size={16} />
          <span>{tag}</span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
