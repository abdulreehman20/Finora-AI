"use server";

import axios, { type AxiosError } from "axios";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/subscription`;

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

/** Extract a human-readable message from an AxiosError or plain Error */
function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<{ message?: string }>;
    const serverMsg = axErr.response?.data?.message;
    if (serverMsg) return serverMsg;
    return `Request failed (${axErr.response?.status ?? "network error"})`;
  }
  return err instanceof Error ? err.message : "Unexpected error";
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: "free" | "pro";
  limits: {
    maxTransactions: number | null;
    analyticsPresets: string[];
    bulkImport: boolean;
  };
}

// ── Get Subscription Status ───────────────────────────────────────────────────
// Reads the user.plan field from our DB (updated by official Polar webhooks)

export async function getSubscriptionStatusAction(): Promise<SubscriptionStatus> {
  try {
    const api = await getAxios();
    const { data } = await api.get(`${BASE}/status`);
    return data;
  } catch (err) {
    console.error("[subscription] status fetch failed:", extractError(err));
    // Safe default — treat as free plan if endpoint is unreachable
    return {
      isSubscribed: false,
      plan: "free",
      limits: {
        maxTransactions: 30,
        analyticsPresets: ["1W"],
        bulkImport: false,
      },
    };
  }
}
