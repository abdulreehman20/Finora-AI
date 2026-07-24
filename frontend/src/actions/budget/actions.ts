"use server";

import axios from "axios";
import { cookies } from "next/headers";
import type {
  Budget,
  BudgetAnalyzeResponse,
  BudgetListResponse,
  CreateBudgetBody,
  UpdateBudgetBody,
} from "@/types/budget";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/budgets`;

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

function toActionError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message;
    throw new Error(message);
  }
  throw error instanceof Error ? error : new Error("Unexpected budget error");
}

export async function getAllBudgetsAction(): Promise<BudgetListResponse> {
  try {
    const api = await getAxios();
    const { data } = await api.get(BASE);
    return data;
  } catch (error) {
    toActionError(error);
  }
}

export async function createBudgetAction(body: CreateBudgetBody) {
  try {
    const api = await getAxios();
    const { data } = await api.post(BASE, body);
    return data as { message: string; budget: Budget };
  } catch (error) {
    toActionError(error);
  }
}

export async function updateBudgetAction(id: string, body: UpdateBudgetBody) {
  try {
    const api = await getAxios();
    const { data } = await api.put(`${BASE}/${id}`, body);
    return data as { message: string; budget: Budget };
  } catch (error) {
    toActionError(error);
  }
}

export async function deleteBudgetAction(id: string) {
  try {
    const api = await getAxios();
    const { data } = await api.delete(`${BASE}/${id}`);
    return data;
  } catch (error) {
    toActionError(error);
  }
}

export async function analyzeBudgetsAction(): Promise<BudgetAnalyzeResponse> {
  try {
    const api = await getAxios();
    const { data } = await api.post(`${BASE}/analyze`);
    return data;
  } catch (error) {
    toActionError(error);
  }
}
