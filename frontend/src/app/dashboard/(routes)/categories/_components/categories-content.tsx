"use client";

import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCategoryAction,
  deleteCategoryAction,
  getAllCategoriesAction,
  updateCategoryAction,
} from "@/actions/categories/actions";
import type { Category, CreateCategoryBody } from "@/types/category";
import { CategoryCard } from "./category-card";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllCategoriesAction();
      setCategories(result.categories ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  async function handleSave(body: CreateCategoryBody) {
    setSaving(true);
    try {
      if (editing) {
        await updateCategoryAction(editing.id, body);
        toast.success("Category updated successfully!");
      } else {
        await createCategoryAction(body);
        toast.success("Category created successfully!");
      }
      setShowForm(false);
      setEditing(null);
      await fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteCategoryAction(deleting.id);
      toast.success("Category deleted successfully!");
      setDeleting(null);
      await fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setSaving(false);
    }
  }

  return (  
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">All Categories</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Organize transactions by category
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
        >
          <IconPlus size={16} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <IconLoader2 size={24} className="animate-spin text-green-500" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Income ({incomeCategories.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={(cat) => {
                    setEditing(cat);
                    setShowForm(true);
                  }}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Expense ({expenseCategories.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={(cat) => {
                    setEditing(cat);
                    setShowForm(true);
                  }}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <CategoryFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditing(null);
        }}
        initial={editing}
        loading={saving}
        onSubmit={handleSave}
      />

      <DeleteCategoryDialog
        category={deleting}
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
