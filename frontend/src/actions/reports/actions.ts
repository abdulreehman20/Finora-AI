"use server";

import axios from "axios";
import { cookies } from "next/headers";
import type {
  ReportListResponse,
  ReportSetting,
  UpdateReportSettingBody,
} from "@/types/report";

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

function toActionError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message;
    throw new Error(message);
  }
  throw error instanceof Error ? error : new Error("Unexpected report error");
}

/** Fetches paginated report history (excludes email content in the UI). */
export async function getAllReportsAction(pagination?: {
  pageSize?: number;
  pageNumber?: number;
}): Promise<ReportListResponse> {
  try {
    const params: Record<string, string> = {};
    if (pagination?.pageSize) params.pageSize = String(pagination.pageSize);
    if (pagination?.pageNumber)
      params.pageNumber = String(pagination.pageNumber);

    const api = await getAxios();
    const { data } = await api.get(`${BASE}/all`, { params });
    return data;
  } catch (error) {
    toActionError(error);
  }
}

/** Loads the user's current report scheduling preferences. */
export async function getReportSettingAction(): Promise<{
  message: string;
  setting: ReportSetting | null;
}> {
  try {
    const api = await getAxios();
    const { data } = await api.get(`${BASE}/setting`);
    return data;
  } catch (error) {
    toActionError(error);
  }
}

/** Saves toggle / frequency / email override settings. */
export async function updateReportSettingAction(
  body: UpdateReportSettingBody,
) {
  try {
    const api = await getAxios();
    const { data } = await api.put(`${BASE}/update-setting`, body);
    return data as { message: string; setting: ReportSetting };
  } catch (error) {
    toActionError(error);
  }
}

/** Resends a previously stored report email by report ID. */
export async function sendReportAction(reportId: string) {
  try {
    const api = await getAxios();
    const { data } = await api.post(`${BASE}/resend/${reportId}`);
    return data;
  } catch (error) {
    toActionError(error);
  }
}
