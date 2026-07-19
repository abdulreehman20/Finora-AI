"use client";

import {
  IconAlertCircle,
  IconLoader2,
  IconTableImport,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { bulkImportTransactionsAction } from "@/actions/transactions/actions";
import { parseCSV } from "@/lib/helper";
import type { PaymentMethod, TransactionType } from "@/types/transaction";

interface BulkImportTransactionProps {
  onClose: () => void;
  onSaved: () => void;
}

export function BulkImportTransaction({
  onClose,
  onSaved,
}: BulkImportTransactionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const [, ...dataRows] = rows;
      const transactions = dataRows
        .filter((r) => r.length >= 5)
        .map((r) => ({
          title: r[0] ?? "Transaction",
          type: (r[1]?.toUpperCase() === "INCOME"
            ? "INCOME"
            : "EXPENSE") as TransactionType,
          amount: Math.round(parseFloat(r[2] ?? "0") * 100),
          category: r[3] ?? "Other",
          date: new Date(r[4] ?? Date.now()).toISOString(),
          isRecurring: false,
          paymentMethod: "OTHER" as PaymentMethod,
        }));
      if (transactions.length === 0)
        throw new Error("No valid rows found in CSV");
      await bulkImportTransactionsAction(transactions);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[oklch(0.12_0.01_145)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Bulk Import Transactions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <p className="mb-4 text-xs text-zinc-400">
          Upload a CSV with columns:{" "}
          <code className="text-green-400">
            title, type, amount, category, date
          </code>
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <IconAlertCircle size={16} /> {error}
          </div>
        )}

        <div
          className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-8 hover:border-green-500/40 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <IconTableImport size={28} className="text-zinc-500" />
          <p className="text-sm text-zinc-400">
            {fileName || "Click to choose a CSV file"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {preview.length > 0 && (
          <div className="mb-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs">
              <tbody>
                {preview.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      i === 0
                        ? "bg-white/5 text-zinc-300 font-medium"
                        : "text-zinc-400"
                    }
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-1.5 border-b border-white/5 truncate max-w-[100px]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!fileName || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all"
          >
            {loading && <IconLoader2 size={16} className="animate-spin" />}
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
