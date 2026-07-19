"use client";

import type { ReportStatus } from "@/types/report";

export function StatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, { label: string; cls: string }> = {
    SENT: {
      label: "SENT",
      cls: "bg-green-500/15 text-green-400 border border-green-500/20",
    },
    PENDING: {
      label: "PENDING",
      cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    },
    FAILED: {
      label: "FAILED",
      cls: "bg-red-500/15 text-red-400 border border-red-500/20",
    },
    NO_ACTIVITY: {
      label: "NO ACTIVITY",
      cls: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
    },
  };
  const { label, cls } = map[status] ?? map.NO_ACTIVITY;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}
