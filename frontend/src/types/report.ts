export type ReportStatus = "SENT" | "PENDING" | "FAILED" | "NO_ACTIVITY";

export type ReportFrequency = "WEEKLY" | "MONTHLY";

export interface Report {
  id: string;
  userId: string;
  period: string;
  sentDate: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListResponse {
  message: string;
  reports: Report[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  statusCounts?: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    noActivity: number;
  };
}

export interface ReportSetting {
  id?: string;
  userId?: string;
  isEnabled: boolean;
  frequency: ReportFrequency;
  email?: string | null;
  dayOfMonth?: number;
  nextReportDate?: string | null;
  lastSentDate?: string | null;
}

export type UpdateReportSettingBody = Partial<{
  isEnabled: boolean;
  frequency: ReportFrequency;
  email: string | null;
  dayOfMonth: number;
}>;
