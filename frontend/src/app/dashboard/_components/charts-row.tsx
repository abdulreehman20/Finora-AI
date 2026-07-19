"use client";

import {
  IconLoader2,
  IconLock,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortCurrency } from "@/lib/helper";
import { PIE_COLORS } from "./constants";

interface ChartsRowProps {
  isPending: boolean;
  chartData: { date: string; income: number; expenses: number }[];
  chartCounts: { income: number; expenses: number; label: string };
  breakdown: { name: string; value: number; percentage: number }[];
  totalSpent: number;
  presetLabel: string;
  /** When true, shows an upgrade-to-pro banner instead of chart data */
  isGated?: boolean;
}

export function ChartsRow({
  isPending,
  chartData,
  chartCounts,
  breakdown,
  totalSpent,
  presetLabel,
  isGated = false,
}: ChartsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
      {/* Transaction Overview Chart */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.11_0.02_145)] to-[oklch(0.08_0.01_150)] p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Transaction Overview
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Showing total transactions across {chartCounts.label}
            </p>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-zinc-500">No of Income</p>
              <div className="flex items-center justify-end gap-1">
                <IconTrendingUp size={14} className="text-green-400" />
                <span className="text-xl font-bold text-white">
                  {chartCounts.income}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500">No of Expenses</p>
              <div className="flex items-center justify-end gap-1">
                <IconTrendingDown size={14} className="text-red-400" />
                <span className="text-xl font-bold text-white">
                  {chartCounts.expenses}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isGated ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
              <IconLock size={22} className="text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Pro Feature</p>
              <p className="mt-1 text-xs text-zinc-500 max-w-[260px]">
                Upgrade your plan to view monthly, 3-month, yearly or all-time analytics.
              </p>
            </div>
            <a
              href="/dashboard/settings?tab=billing"
              className="rounded-xl bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              Upgrade to Pro
            </a>
          </div>
        ) : isPending ? (
          <div className="flex h-72 items-center justify-center">
            <IconLoader2 size={28} className="animate-spin text-green-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
            No transaction data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatShortCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.14 0.01 145)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(val: number, name: string) => [
                  `$${val.toLocaleString()}`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorIncome)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorExpenses)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expenses Breakdown Chart */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.11_0.01_150)] to-[oklch(0.08_0.02_140)] p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">
            Expenses Breakdown
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Total expenses across {presetLabel}
          </p>
        </div>

        {isPending ? (
          <div className="flex h-72 items-center justify-center">
            <IconLoader2 size={28} className="animate-spin text-green-500" />
          </div>
        ) : breakdown.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
            No expense data for this period.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* Donut Chart */}
            <div className="relative">
              <PieChart width={220} height={220}>
                <Pie
                  data={breakdown}
                  cx={110}
                  cy={110}
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {breakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              {/* Centre label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-white">
                  $
                  {totalSpent.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-zinc-500">Total Spent</p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2.5">
              {breakdown.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                  <span className="flex-1 truncate text-sm text-zinc-300">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-white">
                    $
                    {item.value.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs text-zinc-500">
                    ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
