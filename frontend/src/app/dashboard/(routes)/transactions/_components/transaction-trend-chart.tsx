"use client";

import { IconLoader2, IconLock } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type AnalyticsPreset,
  getChartAnalyticsAction,
} from "@/actions/analytics/actions";
import { getSubscriptionStatusAction } from "@/actions/subscription/actions";
import { formatShortCurrency } from "@/lib/helper";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** UI timeline options mapped onto existing analytics presets. */
type TrendTimeline = "7D" | "30D" | "3M" | "Monthly" | "Yearly";

const TIMELINE_OPTIONS: {
  label: TrendTimeline;
  preset: AnalyticsPreset;
  /** When set, daily points are rolled up client-side for a cleaner axis. */
  aggregate?: "month" | "year";
}[] = [
  { label: "7D", preset: "1W" },
  { label: "30D", preset: "1M" },
  { label: "3M", preset: "3M" },
  { label: "Monthly", preset: "1Y", aggregate: "month" },
  { label: "Yearly", preset: "ALL", aggregate: "year" },
];

interface ChartPoint {
  date: string;
  income: number;
  expenses: number;
}

/** Rolls daily chart points into month or year buckets. */
function aggregateChartData(
  data: ChartPoint[],
  mode: "month" | "year",
): ChartPoint[] {
  const buckets = new Map<string, { income: number; expenses: number }>();

  for (const point of data) {
    const key =
      mode === "month" ? point.date.slice(0, 7) : point.date.slice(0, 4);
    const existing = buckets.get(key) ?? { income: 0, expenses: 0 };
    buckets.set(key, {
      income: existing.income + point.income,
      expenses: existing.expenses + point.expenses,
    });
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));
}

/** Formats X-axis labels based on the active timeline granularity. */
function formatAxisDate(value: string, timeline: TrendTimeline) {
  if (timeline === "Yearly" && /^\d{4}$/.test(value)) return value;
  if (timeline === "Monthly" && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleString("default", { month: "short", year: "2-digit" });
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
}

/**
 * Income vs expense filled-area trend chart for the transactions page.
 * Defaults to the 7D view and reuses the existing analytics chart API.
 */
export function TransactionTrendChart() {
  const [timeline, setTimeline] = useState<TrendTimeline>("7D");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatusAction()
      .then((s) => {
        setIsPro(s.isSubscribed);
        // Free plan analytics are limited to 7 days — default the selector accordingly
        if (!s.isSubscribed) setTimeline("7D");
      })
      .catch(() => {
        setIsPro(false);
        setTimeline("7D");
      })
      .finally(() => setPlanLoading(false));
  }, []);

  const activeOption = useMemo(
    () =>
      TIMELINE_OPTIONS.find((o) => o.label === timeline) ?? TIMELINE_OPTIONS[0],
    [timeline],
  );

  // Free plan analytics are forced to 1W on the backend.
  // Never gate while plan status is unknown — that causes a Pro-banner flicker for subscribers.
  const isGated = !planLoading && !isPro && activeOption.preset !== "1W";

  const fetchChart = useCallback(async () => {
    if (isGated) {
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getChartAnalyticsAction(activeOption.preset);
      const raw = (result.chartData ?? []) as ChartPoint[];
      setChartData(
        activeOption.aggregate
          ? aggregateChartData(raw, activeOption.aggregate)
          : raw,
      );
    } catch {
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [activeOption, isGated]);

  useEffect(() => {
    if (planLoading) return;
    fetchChart();
  }, [fetchChart, planLoading]);

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.11_0.02_145)] to-[oklch(0.08_0.01_150)] p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Transaction Trend
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Income vs expenses over time
          </p>
        </div>

        {/* Timeline selector */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TIMELINE_OPTIONS.map((option) => {
            const locked = !planLoading && !isPro && option.preset !== "1W";
            const active = timeline === option.label;
            return (
              <button
                key={option.label}
                type="button"
                disabled={planLoading}
                onClick={() => setTimeline(option.label)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                } ${locked ? "opacity-70" : ""}`}
              >
                {option.label}
                {locked ? " 🔒" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {planLoading || loading ? (
        <div className="flex h-72 items-center justify-center">
          <IconLoader2 size={28} className="animate-spin text-green-500" />
        </div>
      ) : isGated ? (
        <div className="flex h-72 flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
            <IconLock size={22} className="text-green-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Pro Feature</p>
            <p className="mt-1 max-w-[280px] text-xs text-zinc-500">
              Upgrade your plan to view 30-day, 3-month, monthly, and yearly
              transaction trends.
            </p>
          </div>
          <a
            href="/dashboard/settings?tab=billing"
            className="rounded-xl bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600"
          >
            Upgrade to Pro
          </a>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
          No transaction data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
          >
            <defs>
              {/* Green gradient for income */}
              <linearGradient id="txTrendIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              {/* Red gradient for expenses */}
              {/* Same red (#ef4444) as dashboard Transaction Overview expenses */}
              <linearGradient id="txTrendExpense" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(v: string) => formatAxisDate(v, timeline)}
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
                name === "income" ? "Income" : "Expense",
              ]}
              labelFormatter={(label: string) =>
                formatAxisDate(label, timeline)
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) =>
                value === "income" ? "Income" : "Expense"
              }
              wrapperStyle={{ color: "#a1a1aa", fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="income"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#txTrendIncome)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#txTrendExpense)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
