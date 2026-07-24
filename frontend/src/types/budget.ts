import type { Category } from "./category";

export type BudgetPeriod = "WEEKLY" | "MONTHLY";

export type BudgetStatusTag = "On Track" | "Watch It" | "Over Budget";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  /** Persisted AI insight text from the database (null until Analyze is run). */
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface CreateBudgetBody {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
}

/** Amount edit and/or saving a fresh AI analysis string. */
export interface UpdateBudgetBody {
  amount?: number;
  aiAnalysis?: string | null;
}

export interface BudgetListResponse {
  message: string;
  budgets: Budget[];
}

export interface BudgetAnalysisItem {
  budgetId: string;
  tag: BudgetStatusTag;
  description: string;
}

export interface BudgetAnalyzeResponse {
  message: string;
  analyses: BudgetAnalysisItem[];
}
