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
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
} from "@/lib/category-icons";
import type { Category, CategoryType, CreateCategoryBody } from "@/types/category";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Category | null;
  loading?: boolean;
  onSubmit: (body: CreateCategoryBody) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  initial,
  loading,
  onSubmit,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState<CreateCategoryBody>({
    name: initial?.name ?? "",
    type: initial?.type ?? "EXPENSE",
    icon: initial?.icon ?? "tag",
    color: initial?.color ?? CATEGORY_COLOR_OPTIONS[0],
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? "",
        type: initial?.type ?? "EXPENSE",
        icon: initial?.icon ?? "tag",
        color: initial?.color ?? CATEGORY_COLOR_OPTIONS[0],
      });
    }
  }, [open, initial]);

  const set = <K extends keyof CreateCategoryBody>(
    key: K,
    value: CreateCategoryBody[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  const SelectedIcon = getCategoryIcon(form.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[oklch(0.12_0.01_145)] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {initial ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {initial
              ? "Update this category's details"
              : "Create a new category to organize transactions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
              placeholder="Category name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">
              Type
            </label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 transition-all"
              value={form.type}
              onChange={(e) => set("type", e.target.value as CategoryType)}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_ICON_OPTIONS.map((iconName) => {
                const Icon = getCategoryIcon(iconName);
                const selected = form.icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => set("icon", iconName)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                      selected
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_OPTIONS.map((color) => {
                const selected = form.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => set("color", color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      selected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[oklch(0.12_0.01_145)]"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${form.color}22`, color: form.color }}
            >
              <SelectedIcon size={18} />
            </div>
            <span className="text-sm text-zinc-300">Preview</span>
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
              disabled={loading}
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
