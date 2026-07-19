"use client";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 transition-colors hover:border-white/15">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${category.color}22`,
          color: category.color,
        }}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white">
            {category.name}
          </span>
          {category.isDefault && (
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
          aria-label={`Edit ${category.name}`}
        >
          <IconEdit size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          aria-label={`Delete ${category.name}`}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );
}
