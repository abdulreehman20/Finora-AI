import {
	endOfMonth,
	endOfWeek,
	startOfMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import {
	ReportFrequencyEnum,
	reportSetting,
	user,
} from "../../db/schema/index.js";
import { generateAndDeliverReportService } from "../../services/report.service.js";
import { inngest } from "../client.js";

/** Event name used to fan-out per-user report generation. */
export const REPORT_SEND_EVENT = "finora/report.send";

/**
 * Cron: every Sunday at 09:00 UTC.
 * Fans out report jobs for users with WEEKLY frequency enabled.
 */
export const weeklyReportCron = inngest.createFunction(
	{
		id: "weekly-report-cron",
		triggers: [{ cron: "0 9 * * 0" }],
	},
	async ({ step }) => {
		const users = await step.run("load-weekly-users", async () => {
			return db
				.select({
					userId: reportSetting.userId,
					email: reportSetting.email,
					userEmail: user.email,
					userName: user.name,
				})
				.from(reportSetting)
				.innerJoin(user, eq(reportSetting.userId, user.id))
				.where(
					and(
						eq(reportSetting.isEnabled, true),
						eq(reportSetting.frequency, ReportFrequencyEnum.WEEKLY),
					),
				);
		});

		if (users.length === 0) {
			return { queued: 0 };
		}

		// Previous calendar week (Mon–Sun)
		const now = new Date();
		const to = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
		const from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

		await step.sendEvent(
			"fan-out-weekly-reports",
			users.map((row) => ({
				name: REPORT_SEND_EVENT,
				data: {
					userId: row.userId,
					email: row.email ?? row.userEmail,
					username: row.userName,
					frequency: ReportFrequencyEnum.WEEKLY,
					from: from.toISOString(),
					to: to.toISOString(),
				},
			})),
		);

		return { queued: users.length };
	},
);

/**
 * Cron: 1st of every month at 09:00 UTC.
 * Fans out report jobs for users with MONTHLY frequency enabled.
 */
export const monthlyReportCron = inngest.createFunction(
	{
		id: "monthly-report-cron",
		triggers: [{ cron: "0 9 1 * *" }],
	},
	async ({ step }) => {
		const users = await step.run("load-monthly-users", async () => {
			return db
				.select({
					userId: reportSetting.userId,
					email: reportSetting.email,
					userEmail: user.email,
					userName: user.name,
				})
				.from(reportSetting)
				.innerJoin(user, eq(reportSetting.userId, user.id))
				.where(
					and(
						eq(reportSetting.isEnabled, true),
						eq(reportSetting.frequency, ReportFrequencyEnum.MONTHLY),
					),
				);
		});

		if (users.length === 0) {
			return { queued: 0 };
		}

		const now = new Date();
		const from = startOfMonth(subMonths(now, 1));
		const to = endOfMonth(subMonths(now, 1));

		await step.sendEvent(
			"fan-out-monthly-reports",
			users.map((row) => ({
				name: REPORT_SEND_EVENT,
				data: {
					userId: row.userId,
					email: row.email ?? row.userEmail,
					username: row.userName,
					frequency: ReportFrequencyEnum.MONTHLY,
					from: from.toISOString(),
					to: to.toISOString(),
				},
			})),
		);

		return { queued: users.length };
	},
);

/**
 * Per-user worker: builds the report for the period, emails it, and persists status.
 */
export const processScheduledReport = inngest.createFunction(
	{
		id: "process-scheduled-report",
		triggers: [{ event: REPORT_SEND_EVENT }],
		retries: 3,
	},
	async ({ event, step }) => {
		const { userId, email, username, frequency, from, to } = event.data as {
			userId: string;
			email: string;
			username: string;
			frequency: "WEEKLY" | "MONTHLY";
			from: string;
			to: string;
		};

		const result = await step.run("generate-and-deliver", async () => {
			return generateAndDeliverReportService({
				userId,
				email,
				username,
				frequency,
				fromDate: new Date(from),
				toDate: new Date(to),
			});
		});

		return result;
	},
);
