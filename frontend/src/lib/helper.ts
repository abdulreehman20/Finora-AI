import type { PaymentMethod } from "@/types/transaction";

// ── Currency ──────────────────────────────────────────────────────────────────

/** Format cents as USD. Pass `asDollars: true` for already-dollar values. */
export function formatCurrency(value: number, asDollars = false): string {
  const amount = asDollars ? value : value / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ── Dates ─────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function toISODate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// ── Payment Method ────────────────────────────────────────────────────────────

export function formatPaymentMethod(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    MOBILE_PAYMENT: "Mobile Payment",
    AUTO_DEBIT: "Auto Debit",
    CASH: "Cash",
    OTHER: "Other",
  };
  return map[method] ?? method;
}

// ── CSV ───────────────────────────────────────────────────────────────────────

export function parseCSV(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .map((row) =>
      row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")),
    );
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Format large dollar amounts in abbreviated form (e.g. $1.2k, $3.5M). */
export function formatShortCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
  return `$${val.toFixed(0)}`;
}

export function formatReportDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function buildPageButtons(
  pageNumber: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [];
  const around = new Set([
    1,
    totalPages,
    pageNumber,
    pageNumber - 1,
    pageNumber + 1,
  ]);
  const sorted = Array.from(around)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) pages.push("…");
    pages.push(p);
    prev = p;
  }
  return pages;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
}

export function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSimulatedResponse(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes("spend") || lower.includes("expense")) {
    return "Based on your recent transactions, your top spending categories this month are:\n\n1. **Food & Dining** — $482.50\n2. **Transportation** — $245.00\n3. **Shopping** — $189.99\n4. **Utilities** — $156.00\n\nYour total expenses are approximately **$1,073.49**, which is 15% higher than last month. Consider reviewing your Food & Dining expenses for potential savings.";
  }
  if (lower.includes("save") || lower.includes("saving")) {
    return "Here are some personalized savings tips based on your spending patterns:\n\n📊 **Reduce dining out** — You spent $482 on food this month. Cooking at home could save ~$200/month.\n\n🚗 **Optimize transport** — Consider carpooling or public transit to cut your $245 transportation costs.\n\n💡 **Set up automation** — Create a recurring transfer of 20% of your income to savings on payday.\n\nWith these changes, you could save approximately **$400-500** more per month!";
  }
  if (lower.includes("income") || lower.includes("revenue")) {
    return "Your income overview:\n\n💰 **Total Income (this month):** $3,250.00\n📈 **vs Last Month:** +8.3%\n\nIncome sources:\n- Freelance: $2,000\n- Salary: $1,000\n- Investments: $250\n\nYour income is trending upward. Great job!";
  }
  if (lower.includes("compare") || lower.includes("quarter")) {
    return "Here's your quarterly comparison:\n\n| Metric | This Quarter | Last Quarter | Change |\n|--------|-------------|-------------|--------|\n| Income | $9,750 | $8,900 | +9.6% |\n| Expenses | $7,200 | $6,800 | +5.9% |\n| Savings | $2,550 | $2,100 | +21.4% |\n\nYour savings rate has improved from 23.6% to 26.2%. Keep it up! 🎉";
  }
  return `I understand you're asking about "${query}". Let me analyze your financial data...\n\nBased on your recent transaction history, here are my insights:\n\n• Your overall financial health looks stable\n• I recommend reviewing your recurring expenses for optimization opportunities\n• Consider setting up budget alerts for categories where you tend to overspend\n\nWould you like me to dive deeper into any specific area?`;
}
