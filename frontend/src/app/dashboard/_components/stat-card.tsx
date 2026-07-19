"use client";

import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";

export function Trend({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const isPositive = inverse ? value < 0 : value > 0;
  const color = isPositive ? "text-green-400" : "text-red-400";
  const Icon = value >= 0 ? IconArrowUpRight : IconArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}
    >
      <Icon size={13} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subLabel: string;
  trend?: number;
  trendInverse?: boolean;
  icon: React.ReactNode;
  accent?: string;
  extra?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subLabel,
  trend,
  trendInverse,
  icon,
  accent = "from-green-500/20 to-transparent",
  extra,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.12_0.02_145)] to-[oklch(0.08_0.01_145)] p-6`}
    >
      {/* gradient accent blob */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            {label}
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400">
            {icon}
          </div>
        </div>
        <p className="mb-1 text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{subLabel}</p>
        {(trend !== undefined || extra) && (
          <div className="mt-3 flex items-center gap-2">
            {trend !== undefined && (
              <Trend value={trend} inverse={trendInverse} />
            )}
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}
