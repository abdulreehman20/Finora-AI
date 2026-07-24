"use client";

import {
  IconLoader2,
  IconPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  analyzeBudgetsAction,
  createBudgetAction,
  deleteBudgetAction,
  getAllBudgetsAction,
  updateBudgetAction,
} from "@/actions/budget/actions";
import { getAllCategoriesAction } from "@/actions/categories/actions";
import type { Budget, CreateBudgetBody } from "@/types/budget";
import type { Category } from "@/types/category";
import { BudgetCard } from "./budget-card";
import { BudgetFormDialog } from "./budget-form-dialog";
import { DeleteBudgetDialog } from "./delete-budget-dialog";

export function BudgetContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState<Budget | null>(null);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "EXPENSE"),
    [categories],
  );

  const availableCategories = useMemo(() => {
    const used = new Set(budgets.map((b) => b.categoryId));
    if (editing) {
      return expenseCategories.filter(
        (c) => c.id === editing.categoryId || !used.has(c.id),
      );
    }
    return expenseCategories.filter((c) => !used.has(c.id));
  }, [budgets, editing, expenseCategories]);

  const fetchBudgets = useCallback(async () => {
    const result = await getAllBudgetsAction();
    setBudgets(result.budgets ?? []);
  }, []);

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesResult] = await Promise.all([
        getAllCategoriesAction(),
        fetchBudgets(),
      ]);
      setCategories(categoriesResult.categories ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load budget page",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleSave(body: CreateBudgetBody) {
    setSaving(true);
    try {
      if (editing) {
        await updateBudgetAction(editing.id, { amount: body.amount });
        toast.success("Budget updated successfully!");
      } else {
        await createBudgetAction(body);
        toast.success("Budget created successfully!");
      }

      setShowForm(false);
      setEditing(null);
      await fetchBudgets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteBudgetAction(deleting.id);
      toast.success("Budget deleted successfully!");
      setDeleting(null);
      await fetchBudgets();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete budget",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Runs AI analysis, persists each description via PUT, then refreshes cards.
   * Analysis lives in the database — never in localStorage.
   */
  async function handleAnalyze() {
    if (budgets.length === 0) {
      toast.error("Add a budget before analyzing");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeBudgetsAction();
      const analyses = result.analyses ?? [];

      // Persist each insight so it survives page refreshes
      await Promise.all(
        analyses.map((item) =>
          updateBudgetAction(item.budgetId, {
            aiAnalysis: item.description,
          }),
        ),
      );

      // Optimistic UI update from the analyze response
      const byId = new Map(analyses.map((item) => [item.budgetId, item]));
      setBudgets((prev) =>
        prev.map((budget) => {
          const analysis = byId.get(budget.id);
          if (!analysis) return budget;
          return {
            ...budget,
            aiAnalysis: analysis.description,
          };
        }),
      );
      toast.success("Budgets analyzed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to analyze budgets",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budgets</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Set spending limits per category — AI scores each one automatically
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconSparkles size={16} />
              )}
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              <IconPlus size={16} />
              Add Budget
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <IconLoader2 size={24} className="animate-spin text-green-500" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[oklch(0.10_0.01_145)] px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-white">No budgets yet</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create your first budget to start tracking category spending limits.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={(item) => {
                  setEditing(item);
                  setShowForm(true);
                }}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}

        <BudgetFormDialog
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditing(null);
          }}
          categories={availableCategories}
          initial={editing}
          loading={saving}
          onSubmit={handleSave}
        />

        <DeleteBudgetDialog
          budget={deleting}
          open={!!deleting}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          loading={saving}
          onConfirm={handleDelete}
        />
      </div>
    </main>
  );
}
