"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Budget, BudgetPeriod, CreateBudgetBody } from "@/types/budget";
import type { Category } from "@/types/category";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initial?: Budget | null;
  loading?: boolean;
  onSubmit: (body: CreateBudgetBody) => Promise<void>;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  categories,
  initial,
  loading,
  onSubmit,
}: BudgetFormDialogProps) {
  const isEditing = !!initial;
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");

  useEffect(() => {
    if (!open) return;
    setCategoryId(initial?.categoryId ?? "");
    setAmount(initial ? String(initial.amount) : "");
    setPeriod(initial?.period ?? "MONTHLY");
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    await onSubmit({
      categoryId: isEditing ? initial.categoryId : categoryId,
      amount: parsedAmount,
      period: isEditing ? initial.period : period,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[oklch(0.12_0.01_145)] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Edit Budget" : "New Budget"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isEditing
              ? "Update the spending limit for this category"
              : "Set a spending limit for a category and track it over time"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="budget-category"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Category
            </label>
            <select
              id="budget-category"
              className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isEditing}
              required={!isEditing}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="budget-amount"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Amount
            </label>
            <input
              id="budget-amount"
              type="number"
              min="0.01"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="budget-period"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Period
            </label>
            <select
              id="budget-period"
              className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
              disabled={isEditing}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!isEditing && !categoryId) || !amount}
              className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
