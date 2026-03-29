import { db } from "../../db";
import { randomUUID } from "crypto";
import { and, eq, lte } from "drizzle-orm";
import { calulateNextReportDate } from "../../lib/helper";
import { sendReportEmail } from "../../mailers/report.mailer";
import { generateReportService } from "../../services/report.service";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ReportStatusEnum, report, reportSetting, user } from "../../db/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// processReportJob
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Monthly report cron job.
 *
 * Runs on the 1st of every month at 02:30 UTC (configurable in scheduler.ts).
 *
 * For every user whose `reportSetting.isEnabled` is `true` and whose
 * `nextReportDate` is on or before *now*, the job:
 *
 *   1. Generates an AI report for the **previous calendar month**.
 *   2. Emails the report to the user.
 *   3. Persists a row in the `report` table (status: SENT | FAILED | NO_ACTIVITY).
 *   4. Advances `nextReportDate` and updates `lastSentDate` in `reportSetting`.
 *
 * Individual per-user failures are caught and counted so one bad user
 * never aborts the rest of the batch.
 */
export const processReportJob = async () => {
	const now = new Date();

	let processedCount = 0;
	let failedCount = 0;

	// Report covers the previous full calendar month.
	// e.g. if today is 2026-04-01, report covers 2026-03-01 → 2026-03-31.
	const from = startOfMonth(subMonths(now, 1));
	const to = endOfMonth(subMonths(now, 1));

	try {
		// ── Fetch all due settings joined with the user row ─────────────────────
		// A setting is "due" when:
		//   - isEnabled  = true
		//   - nextReportDate <= now  (the scheduled firing time has passed)
		const dueSettings = await db
			.select({
				settingId: reportSetting.id,
				userId: reportSetting.userId,
				frequency: reportSetting.frequency,
				dayOfMonth: reportSetting.dayOfMonth,
				lastSentDate: reportSetting.lastSentDate,
				nextReportDate: reportSetting.nextReportDate,
				userEmail: user.email,
				userName: user.name,
			})
			.from(reportSetting)
			.innerJoin(user, eq(reportSetting.userId, user.id))
			.where(
				and(
					eq(reportSetting.isEnabled, true),
					lte(reportSetting.nextReportDate, now),
				),
			);

		console.log(
			`[processReportJob] Running — ${dueSettings.length} setting(s) due`,
		);

		// ── Process each user ────────────────────────────────────────────────────
		for (const setting of dueSettings) {
			try {
				// 1. Generate the AI report (reuses the same service as the API)
				const reportData = await generateReportService(
					setting.userId,
					from,
					to,
				);

				// generateReportService already handles emailing + DB insert when
				// called from the API.  For the cron we call the *raw* generation
				// logic separately so we can control email delivery and status
				// tracking ourselves.  But since generateReportService already
				// inserts a report row, we skip the duplicate insert here and only
				// update the reportSetting timestamps.

				// NOTE: generateReportService now handles email + DB persistence
				// internally.  We only need to advance the schedule below.

				let emailSent = false;

				if (reportData) {
					// Attempt to (re-)send via the mailer for the scheduled frequency
					try {
						await sendReportEmail({
							email: setting.userEmail,
							username: setting.userName,
							report: {
								period: reportData.period,
								totalIncome: reportData.summary.income,
								totalExpenses: reportData.summary.expenses,
								availableBalance: reportData.summary.balance,
								savingsRate: reportData.summary.savingsRate,
								topSpendingCategories: reportData.summary.topCategories,
								insights: reportData.insights,
							},
							frequency: setting.frequency,
						});
						emailSent = true;
					} catch (emailError) {
						console.error(
							`[processReportJob] Email failed for user ${setting.userId}:`,
							emailError,
						);
					}
				}

				// 2. Determine report status
				const reportStatus =
					reportData && emailSent
						? ReportStatusEnum.SENT
						: reportData
							? ReportStatusEnum.FAILED
							: ReportStatusEnum.NO_ACTIVITY;

				const reportPeriod =
					reportData?.period ??
					`${format(from, "MMMM d")}–${format(to, "d, yyyy")}`;

				// 3. Atomically: insert report history row + advance the schedule
				await db.transaction(async (tx) => {
					// Persist report record for historical display
					await tx.insert(report).values({
						id: randomUUID(),
						userId: setting.userId,
						sentDate: now,
						period: reportPeriod,
						status: reportStatus,
					});

					// Advance next report date using the user's chosen dayOfMonth
					await tx
						.update(reportSetting)
						.set({
							lastSentDate: emailSent ? now : reportSetting.lastSentDate,
							nextReportDate: calulateNextReportDate(now, setting.dayOfMonth),
						})
						.where(eq(reportSetting.id, setting.settingId));
				});

				processedCount++;
			} catch (userError) {
				console.error(
					`[processReportJob] Failed to process report for user ${setting.userId}:`,
					userError,
				);
				failedCount++;
			}
		}

		console.log(`[processReportJob] ✅ Processed: ${processedCount} report(s)`);
		console.log(`[processReportJob] ❌ Failed:    ${failedCount} report(s)`);

		return { success: true, processedCount, failedCount };
	} catch (error) {
		console.error("[processReportJob] Fatal error during batch run:", error);
		return { success: false, error: "Report process failed" };
	}
};
