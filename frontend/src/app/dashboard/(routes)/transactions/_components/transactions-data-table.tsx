"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconSelector,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteTransactionsAction,
  deleteTransactionAction,
  duplicateTransactionAction,
} from "@/actions/transactions/actions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildPageButtons, formatCurrency, formatDate, formatPaymentMethod } from "@/lib/helper";
import type { Transaction } from "@/types/transaction";

// ── Confirm Delete Modal ───────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

function ConfirmDeleteModal({
  title,
  description,
  onCancel,
  onConfirm,
  loading,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.12_0.01_145)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <IconAlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            {loading && <IconLoader2 size={14} className="animate-spin" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField =
  | "createdAt"
  | "title"
  | "category"
  | "type"
  | "amount"
  | "date"
  | "paymentMethod"
  | "isRecurring";
type SortDir = "asc" | "desc";

export interface TransactionsDataTableProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onEdit: (tx: Transaction) => void;
}

// ── Data Table ────────────────────────────────────────────────────────────────

export function TransactionsDataTable({
  transactions,
  loading,
  error,
  total,
  pageNumber,
  pageSize,
  totalPages,
  onPageChange,
  onRefresh,
  onEdit,
}: TransactionsDataTableProps) {
  // Client-side sort & filter
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "INCOME" | "EXPENSE">("");
  const [recurringFilter, setRecurringFilter] = useState<
    "" | "RECURRING" | "NON_RECURRING"
  >("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Row action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const displayed = [...transactions]
    .filter((t) => {
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.category.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (typeFilter && t.type !== typeFilter) return false;
      if (recurringFilter === "RECURRING" && !t.isRecurring) return false;
      if (recurringFilter === "NON_RECURRING" && t.isRecurring) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      if (sortField === "amount") {
        va = a.amount;
        vb = b.amount;
      } else if (sortField === "date") {
        va = a.date;
        vb = b.date;
      } else if (sortField === "createdAt") {
        va = a.createdAt;
        vb = b.createdAt;
      } else {
        va = String(a[sortField]);
        vb = String(b[sortField]);
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <IconSelector size={14} className="text-zinc-600 ml-1" />;
    return sortDir === "asc" ? (
      <IconSortAscending size={14} className="text-green-400 ml-1" />
    ) : (
      <IconSortDescending size={14} className="text-green-400 ml-1" />
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === displayed.length) setSelected(new Set());
    else setSelected(new Set(displayed.map((t) => t.id)));
  }

  // ── Delete handlers ────────────────────────────────────────────────────────

  async function confirmSingleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTransactionAction(deleteTarget);
      toast.success("Transaction deleted successfully!");
      onRefresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
      setOpenMenuId(null);
    }
  }

  async function confirmBulkDelete() {
    if (selected.size === 0) return;
    setDeleteLoading(true);
    try {
      await bulkDeleteTransactionsAction(Array.from(selected));
      toast.success(`${selected.size} transaction(s) deleted successfully!`);
      setSelected(new Set());
      onRefresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete transactions",
      );
    } finally {
      setDeleteLoading(false);
      setBulkDeleteConfirm(false);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateTransactionAction(id);
      toast.success("Transaction duplicated successfully!");
      onRefresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate transaction",
      );
    }
    setOpenMenuId(null);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Single delete confirm */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction? This cannot be undone."
          onCancel={() => {
            setDeleteTarget(null);
            setOpenMenuId(null);
          }}
          onConfirm={confirmSingleDelete}
          loading={deleteLoading}
        />
      )}

      {/* Bulk delete confirm */}
      {bulkDeleteConfirm && (
        <ConfirmDeleteModal
          title={`Delete ${selected.size} Transaction${selected.size > 1 ? "s" : ""}`}
          description={`You are about to permanently delete ${selected.size} selected transaction${selected.size > 1 ? "s" : ""}. This cannot be undone.`}
          onCancel={() => setBulkDeleteConfirm(false)}
          onConfirm={confirmBulkDelete}
          loading={deleteLoading}
        />
      )}

      <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] overflow-hidden">
        {/* ── Filter Bar ── */}
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Category */}
            <div className="relative">
              <select
                className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-zinc-300 outline-none hover:border-white/20 transition-all cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>

            {/* Type */}
            <div className="relative">
              <select
                className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-zinc-300 outline-none hover:border-white/20 transition-all cursor-pointer"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as never)}
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>

            {/* Recurring */}
            <div className="relative">
              <select
                className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-zinc-300 outline-none hover:border-white/20 transition-all cursor-pointer"
                value={recurringFilter}
                onChange={(e) => setRecurringFilter(e.target.value as never)}
              >
                <option value="">Frequency</option>
                <option value="RECURRING">Recurring</option>
                <option value="NON_RECURRING">One-time</option>
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              title="Refresh"
            >
              <IconRefresh size={16} />
            </button>
          </div>
        </div>

        {/* ── Bulk Delete Bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-white/10 bg-green-500/5 px-5 py-3">
            <span className="text-sm text-green-400">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all"
            >
              <IconTrash size={14} /> Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-500">
                <th className="w-10 px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    className="rounded accent-green-500"
                    checked={
                      selected.size > 0 && selected.size === displayed.length
                    }
                    onChange={toggleAll}
                  />
                </th>
                {(
                  [
                    { label: "Date Created", field: "createdAt" as SortField },
                    { label: "Title", field: "title" as SortField },
                    { label: "Category", field: "category" as SortField },
                    { label: "Type", field: "type" as SortField },
                    { label: "Amount", field: "amount" as SortField },
                    { label: "Tx Date", field: "date" as SortField },
                    { label: "Payment", field: "paymentMethod" as SortField },
                    { label: "Frequency", field: "isRecurring" as SortField },
                  ] as const
                ).map(({ label, field }) => (
                  <th
                    key={field}
                    className="cursor-pointer select-none whitespace-nowrap px-4 py-3.5 text-left font-medium hover:text-zinc-300 transition-colors"
                    onClick={() => toggleSort(field)}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left font-medium" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-zinc-500">
                      <IconLoader2
                        size={20}
                        className="animate-spin text-green-500"
                      />
                      <span className="text-sm">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <IconAlertCircle size={28} className="text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                      <button
                        type="button"
                        onClick={onRefresh}
                        className="rounded-lg bg-white/5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10 transition-all"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center text-sm text-zinc-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                displayed.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`group border-b border-white/5 transition-colors hover:bg-white/[0.03] ${
                      selected.has(tx.id) ? "bg-green-500/5" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="rounded accent-green-500"
                        checked={selected.has(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-zinc-300">
                      {formatDate(tx.createdAt)}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-white max-w-[180px] truncate">
                      {tx.title}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-300">{tx.category}</td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                          tx.type === "INCOME"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-3.5 font-semibold ${
                        tx.type === "INCOME" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-zinc-300">
                      {formatDate(tx.date)}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-300 whitespace-nowrap">
                      {formatPaymentMethod(tx.paymentMethod)}
                    </td>

                    <td className="px-4 py-3.5">
                      {tx.isRecurring ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                            <IconRefresh size={12} className="text-green-400" />
                            {tx.recurringInterval
                              ? tx.recurringInterval.charAt(0) +
                                tx.recurringInterval.slice(1).toLowerCase()
                              : "Recurring"}
                          </div>
                          {tx.nextRecurringDate && (
                            <div className="mt-0.5 text-[10px] text-zinc-500">
                              Next: {formatDate(tx.nextRecurringDate)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <span className="h-3.5 w-3.5 rounded-full border border-zinc-600 flex items-center justify-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                          </span>
                          One-time
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === tx.id ? null : tx.id)
                          }
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
                        >
                          <IconDotsVertical size={16} />
                        </button>

                        {openMenuId === tx.id && (
                          <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-white/10 bg-[oklch(0.14_0.01_145)] p-1.5 shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                onEdit(tx);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <IconEdit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(tx.id)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <IconCopy size={14} /> Duplicate
                            </button>
                            <div className="my-1 h-px bg-white/10" />
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(tx.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <IconTrash size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <span className="text-xs text-zinc-500">
              Showing{" "}
              <span className="text-zinc-300 font-medium">
                {Math.min((pageNumber - 1) * pageSize + 1, total)}–
                {Math.min(pageNumber * pageSize, total)}
              </span>{" "}
              of <span className="text-zinc-300 font-medium">{total}</span> transactions
            </span>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => pageNumber > 1 && onPageChange(pageNumber - 1)}
                    className={`text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 cursor-pointer ${pageNumber <= 1 ? "opacity-40 pointer-events-none" : ""}`}
                  />
                </PaginationItem>

                {buildPageButtons(pageNumber, totalPages).map((btn, idx) =>
                  btn === "…" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis className="text-zinc-500" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={btn}>
                      <PaginationLink
                        onClick={() => onPageChange(btn)}
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
                    onClick={() => pageNumber < totalPages && onPageChange(pageNumber + 1)}
                    className={`text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 cursor-pointer ${pageNumber >= totalPages ? "opacity-40 pointer-events-none" : ""}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Overlay to close menu on outside click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </>
  );
}
