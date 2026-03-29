export type ReportStatus = "SENT" | "PENDING" | "FAILED" | "NO_ACTIVITY";

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
}

export interface ReportSetting {
  isEnabled: boolean;
  dayOfMonth: number;
}
