import type { AnalyticsPreset } from "@/actions/analytics/actions";

export const DASHBOARD_PRESETS: { label: string; value: AnalyticsPreset }[] = [
  { label: "Last 7 Days", value: "1W" },
  { label: "Last 30 Days", value: "1M" },
  { label: "Last 3 Months", value: "3M" },
  { label: "Last 6 Months", value: "6M" },
  { label: "Last Year", value: "1Y" },
  { label: "All Time", value: "ALL" },
];

export const PIE_COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f97316", // orange-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#6b7280", // gray-500
];
