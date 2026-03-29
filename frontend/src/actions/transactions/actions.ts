"use server";

import axios from "axios";
import { cookies } from "next/headers";
import type {
  CreateTransactionBody,
  PaginationParams,
  TransactionFilters,
  TransactionListResponse,
  UpdateTransactionBody,
} from "@/types/transaction";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/transaction`;

/** Build an Axios instance that forwards the session cookie on every request */
async function getAxios() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
}

// ── Get All Transactions ──────────────────────────────────────────────────────

export async function getAllTransactionsAction(
  filters?: TransactionFilters,
  pagination?: PaginationParams,
): Promise<TransactionListResponse> {
  const params: Record<string, string> = {};
  if (filters?.keyword) params.keyword = filters.keyword;
  if (filters?.type) params.type = filters.type;
  if (filters?.recurringStatus)
    params.recurringStatus = filters.recurringStatus;
  if (pagination?.pageSize) params.pageSize = String(pagination.pageSize);
  if (pagination?.pageNumber) params.pageNumber = String(pagination.pageNumber);

  const api = await getAxios();
  const { data } = await api.get(`${BASE}/all`, { params });
  return data;
}

// ── Get Single Transaction ────────────────────────────────────────────────────

export async function getTransactionByIdAction(id: string) {
  const api = await getAxios();
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

// ── Create Transaction ────────────────────────────────────────────────────────

export async function createTransactionAction(body: CreateTransactionBody) {
  const api = await getAxios();
  const { data } = await api.post(`${BASE}/create`, body);
  return data;
}

// ── Update Transaction ────────────────────────────────────────────────────────

export async function updateTransactionAction(
  id: string,
  body: UpdateTransactionBody,
) {
  const api = await getAxios();
  const { data } = await api.put(`${BASE}/update/${id}`, body);
  return data;
}

// ── Duplicate Transaction ─────────────────────────────────────────────────────

export async function duplicateTransactionAction(id: string) {
  const api = await getAxios();
  const { data } = await api.put(`${BASE}/duplicate/${id}`);
  return data;
}

// ── Delete Transaction ────────────────────────────────────────────────────────

export async function deleteTransactionAction(id: string) {
  const api = await getAxios();
  const { data } = await api.delete(`${BASE}/delete/${id}`);
  return data;
}

// ── Scan Receipt ──────────────────────────────────────────────────────────────
// Note: FormData must be sent via client-side fetch (not server action).
// This action receives base64 data as a fallback approach.
export async function scanReceiptAction(formData: FormData) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BASE}/scan-receipt`, {
    method: "POST",
    cache: "no-store",
    headers: { Cookie: cookieHeader },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Receipt scan failed");
  }
  return res.json();
}

// ── Bulk Import Transactions ──────────────────────────────────────────────────

export async function bulkImportTransactionsAction(
  transactions: CreateTransactionBody[],
) {
  const api = await getAxios();
  const { data } = await api.post(`${BASE}/bulk-transaction`, { transactions });
  return data;
}

// ── Bulk Delete Transactions ──────────────────────────────────────────────────

export async function bulkDeleteTransactionsAction(transactionIds: string[]) {
  const api = await getAxios();
  const { data } = await api.delete(`${BASE}/bulk-delete`, {
    data: { transactionIds },
  });
  return data;
}
