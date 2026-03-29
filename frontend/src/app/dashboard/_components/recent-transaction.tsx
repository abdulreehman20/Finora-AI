"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconLoader2,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { getAllTransactionsAction } from "@/actions/transactions/actions";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/helper";
import type { Transaction } from "@/types/transaction";

interface RecentTransactionsProps {
  /** Pass a monotonically increasing version number to trigger a refresh */
  refreshKey?: number;
}

export function RecentTransactions({ refreshKey = 0 }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTransactionsAction(
        {},
        { pageNumber: 1, pageSize: 5 },
      );
      setTransactions(result.transactions ?? []);
    } catch {
      // silently fail — dashboard widget
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever refreshKey changes (e.g. after adding a transaction)
  useEffect(() => {
    fetchRecent();
  }, [fetchRecent, refreshKey]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[oklch(0.10_0.01_145)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-base font-semibold text-white">
          Recent Transactions
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Your latest financial activity
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-zinc-500">
              <th className="px-6 py-3 text-left font-medium">Transaction</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-zinc-500">
                    <IconLoader2
                      size={20}
                      className="animate-spin text-green-500"
                    />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-zinc-500"
                >
                  No transaction available
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          tx.type === "INCOME"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {tx.type === "INCOME" ? (
                          <IconArrowUpRight size={16} />
                        ) : (
                          <IconArrowDownRight size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white truncate max-w-[160px]">
                          {tx.title}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {tx.type === "INCOME" ? "Income" : "Expense"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300">{tx.category}</td>
                  <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                    {formatPaymentMethod(tx.paymentMethod)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`font-semibold ${
                        tx.type === "INCOME" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
