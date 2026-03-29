"use client";

import {
  IconAlertCircle,
  IconPlus,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  type AnalyticsPreset,
  getChartAnalyticsAction,
  getExpenseBreakdownAction,
  getSummaryAnalyticsAction,
} from "@/actions/analytics/actions";
import { getSubscriptionStatusAction } from "@/actions/subscription/actions";
import { authClient } from "@/lib/auth-client";

import { DASHBOARD_PRESETS } from "./constants";
import { SummaryCards } from "./summary-cards";
import { ChartsRow } from "./charts-row";
import { RecentTransactions } from "./recent-transaction";
import { AddTransactionSheet } from "../(routes)/transactions/_components/add-transaction-sheet";

export function DashboardContent() {
  const { data: session } = authClient.useSession();
  const [preset, setPreset] = useState<AnalyticsPreset>("1W");
  const [showAddTx, setShowAddTx] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [txRefreshKey, setTxRefreshKey] = useState(0);

  // Plan gating state
  const [isPro, setIsPro] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);

  // Data state
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getSummaryAnalyticsAction>
  > | null>(null);
  const [chartData, setChartData] = useState<
    { date: string; income: number; expenses: number }[]
  >([]);
  const [chartCounts, setChartCounts] = useState({
    income: 0,
    expenses: 0,
    label: "Last 7 Days",
  });
  const [breakdown, setBreakdown] = useState<
    { name: string; value: number; percentage: number }[]
  >([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load plan status on mount
  useEffect(() => {
    getSubscriptionStatusAction()
      .then((s) => setIsPro(s.isSubscribed))
      .catch(() => setIsPro(false))
      .finally(() => setPlanLoading(false));
  }, []);

  // Free plan only allows "1W" preset
  const FREE_PRESETS: AnalyticsPreset[] = ["1W"];
  const allowedPresets = isPro
    ? DASHBOARD_PRESETS.map((p) => p.value)
    : FREE_PRESETS;

  // If current preset is not allowed (e.g., user changed to free), reset to 1W
  useEffect(() => {
    if (!planLoading && !isPro && preset !== "1W") {
      setPreset("1W");
    }
  }, [isPro, planLoading, preset]);

  const fetchAll = useCallback((p: AnalyticsPreset) => {
    startTransition(async () => {
      setLoadError(null);
      try {
        const [sum, chart, pie] = await Promise.all([
          getSummaryAnalyticsAction(p),
          getChartAnalyticsAction(p),
          getExpenseBreakdownAction(p),
        ]);
        setSummary(sum);
        setChartData(chart.chartData);
        setChartCounts({
          income: chart.totalIncomeCount,
          expenses: chart.totalExpenseCount,
          label: chart.preset.label,
        });
        setBreakdown(pie.breakdown);
        setTotalSpent(pie.totalSpent);
      } catch {
        setLoadError("Failed to load analytics. Please try again.");
      }
    });
  }, []);

  useEffect(() => {
    fetchAll(preset);
  }, [preset, fetchAll]);

  const userName =
    session?.user?.name ??
    (session?.user as unknown as Record<string, string>)?.username ??
    "there";

  const presetLabel =
    DASHBOARD_PRESETS.find((p) => p.value === preset)?.label ?? "Last 7 Days";

  function handleTransactionSaved() {
    fetchAll(preset);
    // bump key so RecentTransactions re-fetches
    setTxRefreshKey((k) => k + 1);
  }

  function handlePresetChange(newPreset: AnalyticsPreset) {
    if (!isPro && newPreset !== "1W") {
      // Don't block — let ChartsRow show the upgrade message
      // We still change the preset to show the locked state
    }
    setPreset(newPreset);
  }

  // If free user selected a non-1W preset, we show the gate on the chart
  const isGated = !isPro && preset !== "1W";

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-green-400">{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              This is your overview report for the selected period
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Timeline selector */}
            <div className="relative">
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value as AnalyticsPreset)}
                className="appearance-none rounded-xl border border-white/15 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-zinc-300 outline-none hover:border-white/25 transition-all cursor-pointer"
              >
                {DASHBOARD_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                    {!isPro && p.value !== "1W" ? " 🔒" : ""}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Add Transaction */}
            <button
              type="button"
              onClick={() => setShowAddTx(true)}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              <IconPlus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Error */}
        {loadError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <IconAlertCircle size={18} />
            {loadError}
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards
          summary={summary}
          isPending={isPending}
          presetLabel={presetLabel}
        />

        {/* Charts Row — pass isGated so it can show the upgrade message */}
        <ChartsRow
          isPending={isPending}
          chartData={isGated ? [] : chartData}
          chartCounts={chartCounts}
          breakdown={isGated ? [] : breakdown}
          totalSpent={isGated ? 0 : totalSpent}
          presetLabel={presetLabel}
          isGated={isGated}
        />

        {/* Recent Transactions — refreshes when txRefreshKey changes */}
        <RecentTransactions refreshKey={txRefreshKey} />
      </div>

      {/* Add Transaction Sheet */}
      <AddTransactionSheet
        open={showAddTx}
        onOpenChange={setShowAddTx}
        onSaved={handleTransactionSaved}
      />
    </main>
  );
}
