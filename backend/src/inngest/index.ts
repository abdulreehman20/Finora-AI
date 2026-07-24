import { inngest } from "./client.js";
import {
	monthlyReportCron,
	processScheduledReport,
	weeklyReportCron,
} from "./functions/report.functions.js";

/**
 * All Inngest functions served at `/api/inngest`.
 * Add new functions here so the Dev Server / Cloud can discover them.
 */
export const functions = [
	weeklyReportCron,
	monthlyReportCron,
	processScheduledReport,
];

export { inngest };
