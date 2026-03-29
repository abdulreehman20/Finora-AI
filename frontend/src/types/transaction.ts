export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type PaymentMethod =
  | "CARD"
  | "BANK_TRANSFER"
  | "MOBILE_PAYMENT"
  | "AUTO_DEBIT"
  | "CASH"
  | "OTHER";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number; // in cents
  category: string;
  receiptUrl?: string | null;
  recurringInterval?: RecurringInterval | null;
  nextRecurringDate?: string | null;
  lastProcessed?: string | null;
  isRecurring: boolean;
  description?: string | null;
  date: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  keyword?: string;
  type?: TransactionType;
  recurringStatus?: "RECURRING" | "NON_RECURRING";
}

export interface PaginationParams {
  pageSize?: number;
  pageNumber?: number;
}

export interface TransactionListResponse {
  message: string;
  transactions: Transaction[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateTransactionBody {
  title: string;
  description?: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  receiptUrl?: string;
  paymentMethod: PaymentMethod;
}

export type UpdateTransactionBody = Partial<CreateTransactionBody>;
