"use server";

import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/analytics`;

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

export type AnalyticsPreset = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

// ── Summary Analytics ─────────────────────────────────────────────────────────

export async function getSummaryAnalyticsAction(
  preset?: AnalyticsPreset,
  from?: string,
  to?: string,
) {
  const api = await getAxios();

  const params: Record<string, string> = {};
  if (preset && preset !== "ALL") params.preset = preset;
  if (from) params.from = from;
  if (to) params.to = to;

  const { data } = await api.get(`${BASE}/summary`, { params });
  return data.data as {
    availableBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingRate: {
      percentage: number;
      expenseRatio: number;
      savingsRate: number;
    };
    transactionCount: number;
    percentageChange: {
      income: number;
      expenses: number;
      balance: number;
      previousValues: {
        incomeAmount: number;
        expenseAmount: number;
        balanceAmount: number;
      };
    };
    preset: { label: string; value: string };
  };
}

// ── Chart Analytics ───────────────────────────────────────────────────────────

export async function getChartAnalyticsAction(
  preset?: AnalyticsPreset,
  from?: string,
  to?: string,
) {
  const api = await getAxios();

  const params: Record<string, string> = {};
  if (preset && preset !== "ALL") params.preset = preset;
  if (from) params.from = from;
  if (to) params.to = to;

  const { data } = await api.get(`${BASE}/chart`, { params });
  return data.data as {
    chartData: { date: string; income: number; expenses: number }[];
    totalIncomeCount: number;
    totalExpenseCount: number;
    preset: { label: string; value: string };
  };
}

// ── Expense Breakdown ─────────────────────────────────────────────────────────

export async function getExpenseBreakdownAction(
  preset?: AnalyticsPreset,
  from?: string,
  to?: string,
) {
  const api = await getAxios();

  const params: Record<string, string> = {};
  if (preset && preset !== "ALL") params.preset = preset;
  if (from) params.from = from;
  if (to) params.to = to;

  const { data } = await api.get(`${BASE}/expense-breakdown`, { params });
  return data.data as {
    totalSpent: number;
    breakdown: { name: string; value: number; percentage: number }[];
    preset: { label: string; value: string };
  };
}
