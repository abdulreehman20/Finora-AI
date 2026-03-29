import type { Report } from "@/types/report";

export const FAKE_REPORTS: Report[] = [
  {
    id: "fake-1",
    userId: "demo",
    period: "May 1-31, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z",
  },
  {
    id: "fake-2",
    userId: "demo",
    period: "April 1-30, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-04-24T00:00:00.000Z",
    updatedAt: "2025-04-24T00:00:00.000Z",
  },
  {
    id: "fake-3",
    userId: "demo",
    period: "February 1-28, 2025",
    sentDate: "2025-05-24T00:00:00.000Z",
    status: "SENT",
    createdAt: "2025-02-24T00:00:00.000Z",
    updatedAt: "2025-02-24T00:00:00.000Z",
  },
];
