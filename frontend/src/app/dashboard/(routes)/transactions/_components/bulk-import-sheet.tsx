"use client";

import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileSpreadsheet,
  IconLoader2,
  IconTableImport,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { bulkImportTransactionsAction } from "@/actions/transactions/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { parseCSV } from "@/lib/helper";
import type { PaymentMethod, TransactionType } from "@/types/transaction";

// ── Column mapping types ──────────────────────────────────────────────────────

const TRANSACTION_FIELDS = [
  "Title",
  "Type",
  "Amount",
  "Category",
  "Description",
  "Date",
  "PaymentMethod",
  "Skip",
] as const;
type TransactionField = (typeof TRANSACTION_FIELDS)[number];

interface ColumnMapping {
  csvColumn: string;
  field: TransactionField;
}

interface RowError {
  row: number;
  errors: string[];
}

// ── Steps ─────────────────────────────────────────────────────────────────────

type Step = "upload" | "mapping" | "confirm";

interface BulkImportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function BulkImportSheet({
  open,
  onOpenChange,
  onSaved,
}: BulkImportSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function reset() {
    setStep("upload");
    setFileName("");
    setCsvHeaders([]);
    setCsvRows([]);
    setMappings([]);
    setRowErrors([]);
    setExpandedRows(new Set());
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      if (rows.length < 2) {
        toast.error("CSV must have a header row and at least one data row.");
        return;
      }
      const headers = rows[0];
      const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim()));
      setCsvHeaders(headers);
      setCsvRows(dataRows);

      // Auto-map columns
      const autoMappings: ColumnMapping[] = headers.map((h) => {
        const lower = h.toLowerCase().replace(/[^a-z]/g, "");
        let field: TransactionField = "Skip";
        if (lower.includes("title") || lower.includes("name")) field = "Title";
        else if (lower.includes("type")) field = "Type";
        else if (lower.includes("amount") || lower.includes("price"))
          field = "Amount";
        else if (lower.includes("category") || lower.includes("cat"))
          field = "Category";
        else if (lower.includes("desc")) field = "Description";
        else if (lower.includes("date") || lower.includes("time"))
          field = "Date";
        else if (
          lower.includes("payment") ||
          lower.includes("method") ||
          lower.includes("pay")
        )
          field = "PaymentMethod";
        return { csvColumn: h, field };
      });
      setMappings(autoMappings);
      setStep("mapping");
    };
    reader.readAsText(file);
  }

  function updateMapping(idx: number, field: TransactionField) {
    setMappings((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], field };
      return next;
    });
  }

  function validateAndProceed() {
    // Validate required fields are mapped
    const requiredFields: TransactionField[] = ["Title", "Type"];
    const mapped = mappings.map((m) => m.field);
    const missing = requiredFields.filter((f) => !mapped.includes(f));
    if (missing.length > 0) {
      toast.error(`Please map required fields: ${missing.join(", ")}`);
      return;
    }

    // Validate each row
    const errors: RowError[] = [];
    csvRows.forEach((row, i) => {
      const errs: string[] = [];
      mappings.forEach((m, j) => {
        if (m.field === "Skip") return;
        const val = row[j]?.trim() ?? "";
        if (m.field === "Amount" && val && isNaN(parseFloat(val))) {
          errs.push("amount: Amount must be a number");
        }
        if (m.field === "Date" && val && isNaN(Date.parse(val))) {
          errs.push("date: Invalid date");
        }
      });
      if (errs.length > 0) {
        errors.push({ row: i + 1, errors: errs });
      }
    });

    setRowErrors(errors);
    setStep("confirm");
  }

  function getFieldIndex(field: TransactionField): number {
    return mappings.findIndex((m) => m.field === field);
  }

  function getCellValue(row: string[], field: TransactionField): string {
    const idx = getFieldIndex(field);
    return idx >= 0 ? (row[idx]?.trim() ?? "") : "";
  }

  async function handleImport() {
    setLoading(true);
    try {
      const transactions = csvRows
        .map((row) => {
          const title = getCellValue(row, "Title") || "Transaction";
          const typeVal = getCellValue(row, "Type").toUpperCase();
          const type = (
            typeVal === "INCOME" ? "INCOME" : "EXPENSE"
          ) as TransactionType;
          const amountStr = getCellValue(row, "Amount");
          const amount = Math.round((parseFloat(amountStr) || 0) * 100);
          const category = getCellValue(row, "Category") || "Other";
          const description = getCellValue(row, "Description") || undefined;
          const dateStr = getCellValue(row, "Date");
          const date =
            dateStr && !isNaN(Date.parse(dateStr))
              ? new Date(dateStr).toISOString()
              : new Date().toISOString();
          const pmVal = getCellValue(row, "PaymentMethod")
            .toUpperCase()
            .replace(/\s+/g, "_");
          const validPMs = [
            "CARD",
            "BANK_TRANSFER",
            "MOBILE_PAYMENT",
            "AUTO_DEBIT",
            "CASH",
            "OTHER",
          ];
          const paymentMethod = (
            validPMs.includes(pmVal) ? pmVal : "OTHER"
          ) as PaymentMethod;

          return {
            title,
            type,
            amount,
            category,
            description,
            date,
            isRecurring: false,
            paymentMethod,
          };
        })
        .filter((t) => t.amount > 0 || t.title);

      if (transactions.length === 0) {
        toast.error("No valid rows to import.");
        return;
      }

      await bulkImportTransactionsAction(transactions);
      toast.success(
        `Successfully imported ${transactions.length} transactions!`,
      );
      onSaved();
      onOpenChange(false);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function toggleRowExpanded(row: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(row)) next.delete(row);
      else next.add(row);
      return next;
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-[oklch(0.08_0.01_145)] border-white/10 overflow-y-auto"
        showCloseButton={true}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-xl font-bold text-white">
            Bulk Import Transactions
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Upload a CSV file and map columns to import transactions
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          {/* ── Step 1: Upload ── */}
          {step === "upload" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Upload a CSV with columns:{" "}
                <code className="text-green-400">
                  title, type, amount, category, description, date,
                  paymentMethod
                </code>
              </p>
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/15 py-10 hover:border-green-500/40 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <IconTableImport size={32} className="text-zinc-500" />
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
            </div>
          )}

          {/* ── Step 2: Column Mapping ── */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  Map CSV Columns
                </h3>
                <span className="text-xs text-zinc-500">
                  {csvRows.length} rows found
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Match the columns from your file to the transaction fields
              </p>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500 pb-1">
                  <span>CSV Column</span>
                  <span>Transaction Field</span>
                </div>
                {mappings.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-4 items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <IconFileSpreadsheet
                        size={14}
                        className="text-green-400 shrink-0"
                      />
                      <span className="truncate">{m.csvColumn}</span>
                    </div>
                    <select
                      className="w-full rounded-lg border border-white/10 bg-[oklch(0.10_0.01_145)] px-2 py-1.5 text-sm text-white outline-none focus:border-green-500/50 transition-all"
                      value={m.field}
                      onChange={(e) =>
                        updateMapping(i, e.target.value as TransactionField)
                      }
                    >
                      {TRANSACTION_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f === "Skip"
                            ? "Skip"
                            : `${f} ${["Title", "Type"].includes(f) ? "*" : ""}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("upload");
                    setFileName("");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 transition-all"
                >
                  <IconArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={validateAndProceed}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                >
                  Continue ({mappings.filter((m) => m.field !== "Skip").length}/
                  {mappings.length})
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm Import ── */}
          {step === "confirm" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">
                Confirm Import
              </h3>
              <p className="text-xs text-zinc-400">
                Review your settings before importing
              </p>

              {/* Import Summary */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <IconFileSpreadsheet size={16} className="text-green-400" />
                  Import Summary
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-zinc-400">File</span>
                  <span className="text-zinc-200 truncate">{fileName}</span>
                  <span className="text-zinc-400">Columns Mapped</span>
                  <span className="text-zinc-200">
                    {mappings.filter((m) => m.field !== "Skip").length}
                  </span>
                  <span className="text-zinc-400">Transactions</span>
                  <span className="text-zinc-200">{csvRows.length}</span>
                </div>
              </div>

              {/* Errors */}
              {rowErrors.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 text-sm text-red-400 font-medium">
                    <IconAlertCircle size={16} />
                    Issues found:
                  </div>
                  {csvRows.map((_, i) => {
                    const err = rowErrors.find((e) => e.row === i + 1);
                    const hasError = !!err;
                    const isExpanded = expandedRows.has(i + 1);
                    return (
                      <div key={i}>
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            hasError
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                          onClick={() => toggleRowExpanded(i + 1)}
                        >
                          <span>Row {i + 1}</span>
                          {hasError ? (
                            isExpanded ? (
                              <IconChevronUp size={14} />
                            ) : (
                              <IconChevronDown size={14} />
                            )
                          ) : (
                            <IconCheck size={14} />
                          )}
                        </button>
                        {hasError && isExpanded && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {err.errors.map((e, j) => (
                              <p
                                key={j}
                                className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-400"
                              >
                                {e}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No errors */}
              {rowErrors.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                  <IconCheck size={16} />
                  All rows are valid and ready to import!
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("mapping")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 transition-all"
                >
                  <IconArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
                >
                  {loading && (
                    <IconLoader2 size={16} className="animate-spin" />
                  )}
                  Confirm Import
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
