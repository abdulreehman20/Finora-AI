"use client";

import { IconLock, IconPlus, IconTableImport } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getSubscriptionStatusAction } from "@/actions/subscription/actions";
import { getAllTransactionsAction } from "@/actions/transactions/actions";
import type { Transaction, TransactionFilters } from "@/types/transaction";
import { AddTransactionSheet } from "./add-transaction-sheet";
import { BulkImportSheet } from "./bulk-import-sheet";
import { TransactionsDataTable } from "./transactions-data-table";

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sheets
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Plan gating
  const [canBulkImport, setCanBulkImport] = useState(false);
  const [txLimit, setTxLimit] = useState<number | null>(30);

  const filters: TransactionFilters = {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllTransactionsAction(filters, {
        pageNumber,
        pageSize,
      });
      setTransactions(result.transactions ?? []);
      setTotalPages(result.totalPages ?? 1);
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch plan status once on mount
  useEffect(() => {
    getSubscriptionStatusAction()
      .then((s) => {
        setCanBulkImport(s.limits.bulkImport);
        setTxLimit(s.limits.maxTransactions);
      })
      .catch(() => {/* silently fall back to free limits */});
  }, []);

  function handleBulkImportClick() {
    if (!canBulkImport) {
      toast.error(
        "Bulk import is a Pro feature. Upgrade your plan to unlock it.",
        { description: "Go to Settings → Billing to upgrade." },
      );
      return;
    }
    setShowImportSheet(true);
  }

  const atTransactionLimit = txLimit !== null && total >= txLimit;

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Transactions</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage and track all your financial transactions
              {txLimit !== null && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    atTransactionLimit
                      ? "bg-red-500/15 text-red-400"
                      : "bg-zinc-500/15 text-zinc-400"
                  }`}
                >
                  {total}/{txLimit} used
                </span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            {/* Bulk Import — locked for free users */}
            <button
              type="button"
              onClick={handleBulkImportClick}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                canBulkImport
                  ? "border-white/15 bg-white/5 text-zinc-300 hover:border-white/25 hover:text-white"
                  : "border-white/10 bg-white/[0.03] text-zinc-500 cursor-not-allowed"
              }`}
            >
              {canBulkImport ? (
                <IconTableImport size={16} />
              ) : (
                <IconLock size={16} />
              )}
              Bulk Import
              {!canBulkImport && (
                <span className="ml-1 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-yellow-400">
                  Pro
                </span>
              )}
            </button>

            {/* Add Transaction — disabled when at limit */}
            <button
              type="button"
              onClick={() => {
                if (atTransactionLimit) {
                  toast.error(
                    `You've reached the free plan limit of ${txLimit} transactions.`,
                    { description: "Upgrade to Pro for unlimited transactions." },
                  );
                  return;
                }
                setShowAddSheet(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              <IconPlus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Plan limit warning banner */}
        {atTransactionLimit && txLimit !== null && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
            <IconLock size={18} className="mt-0.5 shrink-0 text-yellow-400" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">
                Transaction Limit Reached
              </p>
              <p className="mt-0.5 text-xs text-yellow-300/70">
                You&apos;ve used all {txLimit} free plan transactions. Upgrade to Pro
                for unlimited transactions.
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <TransactionsDataTable
          transactions={transactions}
          loading={loading}
          error={error}
          total={total}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(page: number) => setPageNumber(page)}
          onRefresh={fetchData}
          onEdit={(tx: Transaction) => setEditingTx(tx)}
        />
      </div>

      {/* Sheets */}
      <AddTransactionSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSaved={fetchData}
      />
      <AddTransactionSheet
        open={!!editingTx}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingTx(null);
        }}
        onSaved={fetchData}
        initial={editingTx}
      />
      <BulkImportSheet
        open={showImportSheet}
        onOpenChange={setShowImportSheet}
        onSaved={fetchData}
      />
    </main>
  );
}
