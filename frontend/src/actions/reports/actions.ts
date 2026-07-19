"use server";

import axios from "axios";
import { cookies } from "next/headers";
import type { ReportListResponse, ReportSetting } from "@/types/report";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/report`;

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

// ── Get All Reports ───────────────────────────────────────────────────────────

export async function getAllReportsAction(pagination?: {
  pageSize?: number;
  pageNumber?: number;
}): Promise<ReportListResponse> {
  const params: Record<string, string> = {};
  if (pagination?.pageSize) params.pageSize = String(pagination.pageSize);
  if (pagination?.pageNumber) params.pageNumber = String(pagination.pageNumber);

  const api = await getAxios();
  const { data } = await api.get(`${BASE}/all`, { params });
  return data;
}

// ── Generate Report ───────────────────────────────────────────────────────────

export async function generateReportAction(from: string, to: string) {
  const api = await getAxios();
  const { data } = await api.get(`${BASE}/generate`, { params: { from, to } });
  return data;
}

// ── Update Report Settings ────────────────────────────────────────────────────

export async function updateReportSettingAction(body: Partial<ReportSetting>) {
  const api = await getAxios();
  const { data } = await api.put(`${BASE}/update-setting`, body);
  return data;
}

// ── Send / Resend Report ──────────────────────────────────────────────────────

export async function sendReportAction(reportId: string) {
  const api = await getAxios();
  const { data } = await api.post(`${BASE}/resend/${reportId}`);
  return data;
}
