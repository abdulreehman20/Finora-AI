"use client";

import {
  IconCalendar,
  IconClockRecord,
  IconLoader2,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAllReportsAction, sendReportAction } from "@/actions/reports/actions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildPageButtons, formatReportDate } from "@/lib/helper";
import type { Report } from "@/types/report";
import { ReportSettingsSheet } from "./report-settings-sheet";
import { StatusBadge } from "./status-badge";

export function ReportsContent() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllReportsAction({ pageNumber, pageSize });
      const apiReports: Report[] = result.reports ?? [];
      setReports(apiReports);
      setTotalPages(result.totalPages ?? 1);
      setTotal(result.total ?? 0);
    } catch {
      setReports([]);
      setTotal(0);
      setTotalPages(1);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayed = reports;
  const displayedTotal = total;
  const start = displayedTotal > 0 ? Math.min((pageNumber - 1) * pageSize + 1, displayedTotal) : 0;
  const end = Math.min(pageNumber * pageSize, displayedTotal);
  const pageButtons = buildPageButtons(pageNumber, totalPages);

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Report History</h1>
            <p className="mt-1 text-sm text-zinc-400">
              View and manage your financial reports
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
          >
            <IconSettings size={16} />
            Report Settings
          </button>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Report Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Sent Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-zinc-500">
                        <IconLoader2
                          size={20}
                          className="animate-spin text-green-500"
                        />
                        <span className="text-sm">Loading reports...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <p className="text-sm text-red-400">{error}</p>
                    </td>
                  </tr>
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <IconClockRecord size={36} className="text-zinc-600" />
                        <p className="text-sm text-zinc-500">
                          No reports available
                        </p>
                        <p className="text-xs text-zinc-600">
                          Configure your report settings to receive monthly
                          reports.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <IconCalendar
                            size={14}
                            className="shrink-0 text-zinc-500"
                          />
                          {report.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {formatReportDate(report.sentDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                          onClick={async () => {
                            try {
                              await sendReportAction(report.id);
                              toast.success("Report resent successfully!");
                              fetchData();
                            } catch {
                              toast.error("Failed to resend report.");
                            }
                          }}
                        >
                          <IconRefresh size={14} />
                          Resend
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <span className="text-xs text-zinc-500">
                Showing{" "}
                <span className="text-zinc-300 font-medium">
                  {start}–{end}
                </span>{" "}
                of{" "}
                <span className="text-zinc-300 font-medium">
                  {displayedTotal}
                </span>{" "}
                reports
              </span>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pageNumber > 1 && setPageNumber((p) => p - 1)
                      }
                      className={`text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 cursor-pointer ${pageNumber <= 1 ? "opacity-40 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>

                  {pageButtons.map((btn, idx) =>
                    btn === "…" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis className="text-zinc-500" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={btn}>
                        <PaginationLink
                          onClick={() => setPageNumber(btn as number)}
                          isActive={btn === pageNumber}
                          className={`cursor-pointer border-white/10 ${
                            btn === pageNumber
                              ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                              : "text-zinc-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {btn}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pageNumber < totalPages &&
                        setPageNumber((p) => p + 1)
                      }
                      className={`text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 cursor-pointer ${pageNumber >= totalPages ? "opacity-40 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Report Settings Sheet */}
      <ReportSettingsSheet open={showSettings} onOpenChange={setShowSettings} />
    </main>
  );
}
