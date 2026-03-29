"use client";

import { IconAlertCircle, IconLoader2, IconScan } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  createTransactionAction,
  scanReceiptAction,
  updateTransactionAction,
} from "@/actions/transactions/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  PaymentMethod,
  Transaction,
  TransactionType,
} from "@/types/transaction";

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  initial?: Transaction | null;
}

export function AddTransactionSheet({
  open,
  onOpenChange,
  onSaved,
  initial,
}: AddTransactionSheetProps) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    type: (initial?.type ?? "EXPENSE") as TransactionType,
    amount: initial ? initial.amount / 100 : 0,
    category: initial?.category ?? "",
    date: initial
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    isRecurring: initial?.isRecurring ?? false,
    recurringInterval: initial?.recurringInterval ?? "",
    paymentMethod: (initial?.paymentMethod ?? "CASH") as PaymentMethod,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleScanReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const result = await scanReceiptAction(fd);
      // Auto-fill form from AI scan result
      if (result?.data) {
        const d = result.data;
        if (d.title) set("title", d.title);
        if (d.amount)
          set(
            "amount",
            typeof d.amount === "number"
              ? d.amount / 100
              : parseFloat(d.amount) || 0,
          );
        if (d.category) set("category", d.category);
        if (d.date) set("date", new Date(d.date).toISOString().slice(0, 10));
        if (d.type)
          set("type", d.type.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE");
        if (d.paymentMethod) set("paymentMethod", d.paymentMethod);
        toast.success("Receipt scanned successfully!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        amount: Math.round(form.amount * 100),
        category: form.category,
        date: new Date(form.date).toISOString(),
        isRecurring: form.isRecurring,
        recurringInterval:
          form.isRecurring && form.recurringInterval
            ? (form.recurringInterval as never)
            : undefined,
        paymentMethod: form.paymentMethod,
      };
      if (initial) {
        await updateTransactionAction(initial.id, body);
        toast.success("Transaction updated successfully!");
      } else {
        await createTransactionAction(body);
        toast.success("Transaction added successfully!");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save transaction";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[oklch(0.08_0.01_145)] border-white/10 overflow-y-auto"
        showCloseButton={true}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-xl font-bold text-white">
            {initial ? "Edit Transaction" : "Add Transaction"}
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            {initial
              ? "Update this transaction's details"
              : "Add a new transaction to track your finances"}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <IconAlertCircle size={16} />
              {error}
            </div>
          )}

          {/* AI Scan Receipt */}
          {!initial && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white">
                AI Scan Receipt
              </label>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => receiptRef.current?.click()}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-400">
                  {scanning ? (
                    <IconLoader2
                      size={18}
                      className="animate-spin text-green-500"
                    />
                  ) : (
                    <IconScan size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    className="rounded-lg bg-green-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-600 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      receiptRef.current?.click();
                    }}
                  >
                    Choose File
                  </button>
                  <span className="ml-2 text-sm text-zinc-500">
                    No file chosen
                  </span>
                </div>
                <input
                  ref={receiptRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleScanReceipt}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                JPG, PNG, WebP up to 2MB
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Transaction Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => set("type", "INCOME")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    form.type === "INCOME"
                      ? "bg-green-500/15 text-green-400 border-2 border-green-500/40"
                      : "bg-white/5 text-zinc-400 border-2 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="mr-1.5">●</span> Income
                </button>
                <button
                  type="button"
                  onClick={() => set("type", "EXPENSE")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    form.type === "EXPENSE"
                      ? "bg-red-500/15 text-red-400 border-2 border-red-500/40"
                      : "bg-white/5 text-zinc-400 border-2 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="mr-1.5">○</span> Expense
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Title
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                placeholder="Transaction title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                placeholder="$0.00"
                value={form.amount || ""}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Category
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                placeholder="Select or type a category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all resize-none"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Payment Method
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="AUTO_DEBIT">Auto Debit</option>
                <option value="MOBILE_PAYMENT">Mobile Payment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Recurring Toggle */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Recurring Transaction
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Set recurring to repeat this transaction
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.isRecurring}
                    onChange={(e) => set("isRecurring", e.target.checked)}
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors duration-200 ${
                      form.isRecurring ? "bg-green-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`m-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        form.isRecurring ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
              </div>

              {form.isRecurring && (
                <div className="mt-3">
                  <select
                    className="w-full rounded-lg border border-white/10 bg-[oklch(0.10_0.01_145)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50 transition-all"
                    value={form.recurringInterval}
                    onChange={(e) => set("recurringInterval", e.target.value)}
                  >
                    <option value="">Select interval</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              {loading && <IconLoader2 size={16} className="animate-spin" />}
              {initial ? "Update" : "Save"}
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
