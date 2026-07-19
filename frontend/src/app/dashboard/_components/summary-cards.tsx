"use client";

import {
  IconChartPie,
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import type { getSummaryAnalyticsAction } from "@/actions/analytics/actions";
import { StatCard } from "./stat-card";

interface SummaryCardsProps {
  summary: Awaited<ReturnType<typeof getSummaryAnalyticsAction>> | null;
  isPending: boolean;
  presetLabel: string;
}

export function SummaryCards({
  summary,
  isPending,
  presetLabel,
}: SummaryCardsProps) {
  if (isPending && !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Available Balance"
        value={`$${summary.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subLabel={`Showing across ${presetLabel}`}
        trend={summary.percentageChange.balance}
        icon={<IconWallet size={16} />}
        accent="from-green-500/20 to-transparent"
      />
      <StatCard
        label="Total Income"
        value={`$${summary.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subLabel={`Showing across ${presetLabel}`}
        trend={summary.percentageChange.income}
        icon={<IconTrendingUp size={16} />}
        accent="from-blue-500/15 to-transparent"
      />
      <StatCard
        label="Total Expenses"
        value={`-$${summary.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subLabel={`Showing across ${presetLabel}`}
        trend={summary.percentageChange.expenses}
        trendInverse
        icon={<IconTrendingDown size={16} />}
        accent="from-red-500/15 to-transparent"
      />
      <StatCard
        label="Savings Rate"
        value={`${summary.savingRate.percentage.toFixed(1)}%`}
        subLabel={`Showing across ${presetLabel}`}
        icon={<IconChartPie size={16} />}
        accent="from-purple-500/15 to-transparent"
        extra={
          <span className="text-xs text-zinc-500">
            {summary.savingRate.expenseRatio.toFixed(1)}% expense ratio
          </span>
        }
      />
    </div>
  );
}
