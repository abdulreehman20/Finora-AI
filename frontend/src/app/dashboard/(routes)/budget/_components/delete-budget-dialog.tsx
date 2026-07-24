"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Budget } from "@/types/budget";

interface DeleteBudgetDialogProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onConfirm: () => Promise<void>;
}

export function DeleteBudgetDialog({
  budget,
  open,
  onOpenChange,
  loading,
  onConfirm,
}: DeleteBudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[oklch(0.12_0.01_145)] text-white sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <IconAlertTriangle size={20} className="text-red-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              Delete Budget
            </DialogTitle>
          </div>
          <DialogDescription className="text-left text-zinc-400">
            Are you sure you want to delete the{" "}
            <span className="font-medium text-white">
              {budget?.category.name}
            </span>{" "}
            budget? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
