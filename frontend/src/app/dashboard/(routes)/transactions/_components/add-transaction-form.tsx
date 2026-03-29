"use client";

import { IconAlertCircle, IconLoader2, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transactions/actions";
import type {
  PaymentMethod,
  Transaction,
  TransactionType,
} from "@/types/transaction";

interface AddTransactionFormProps {
  onClose: () => void;
  onSaved: () => void;
  initial?: Transaction | null;
}

export function AddTransactionForm({
  onClose,
  onSaved,
  initial,
}: AddTransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        await createTransactionAction(body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save transaction",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[oklch(0.12_0.01_145)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {initial ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <IconAlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Title *
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
              placeholder="e.g. Client Payment"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Type *
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-[oklch(0.12_0.01_145)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Category *
              </label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                placeholder="e.g. Freelance"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Date *
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-white/10 bg-[oklch(0.12_0.01_145)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Payment Method
            </label>
            <select
              className="w-full rounded-lg border border-white/10 bg-[oklch(0.12_0.01_145)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
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

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all resize-none"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.isRecurring}
                onChange={(e) => set("isRecurring", e.target.checked)}
              />
              <div
                className={`h-5 w-9 rounded-full transition-colors duration-200 ${
                  form.isRecurring ? "bg-green-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`h-4 w-4 m-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.isRecurring ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
            <span className="text-sm text-zinc-300">Recurring</span>
          </div>

          {form.isRecurring && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Recurring Interval
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-[oklch(0.12_0.01_145)] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50 transition-all"
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
            >
              {loading && <IconLoader2 size={16} className="animate-spin" />}
              {initial ? "Update" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
