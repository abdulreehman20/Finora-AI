import { db } from "../db";
import { eq } from "drizzle-orm";
import { processReportJob } from "../cron/jobs/report.job";
import { type Request, type Response, Router } from "express";
import { transaction } from "../db/schema/transaction.schema";
import { reportSetting } from "../db/schema/report.setting.schema";
import { processRecurringTransactions } from "../cron/jobs/transaction.job";

const adminRoutes = Router();

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  DEV / TEST ONLY ROUTES
// These endpoints are NEVER exposed in production (see routes/index.ts guard).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/run/recurring-transactions
 *
 * Manually triggers the recurring-transactions cron job right now.
 * Use this to test recurring transaction processing without waiting for 00:05 UTC.
 */
adminRoutes.post(
	"/run/recurring-transactions",
	async (_req: Request, res: Response) => {
		console.log("🔧 Manual trigger: processRecurringTransactions");
		const result = await processRecurringTransactions();
		res.json({ message: "Recurring-transactions job executed", ...result });
	},
);

/**
 * POST /api/admin/run/report-job
 *
 * Manually triggers the monthly report cron job right now.
 *
 * The job will pick up every reportSetting row where:
 *   - isEnabled = true
 *   - nextReportDate <= NOW()
 *
 * Use PATCH /api/admin/report-setting/:userId/set-due-now first to make
 * your test user appear in that query.
 */
adminRoutes.post("/run/report-job", async (_req: Request, res: Response) => {
	console.log("🔧 Manual trigger: processReportJob");
	const result = await processReportJob();
	res.json({ message: "Report job executed", ...result });
});

/**
 * PATCH /api/admin/report-setting/:userId/set-due-now
 *
 * Force-sets nextReportDate = NOW() and isEnabled = true for a user so
 * the next call to /run/report-job will pick them up.
 *
 * Params:
 *   userId – the user's ID (from the `user` table)
 */
adminRoutes.patch(
	"/report-setting/:userId/set-due-now",
	async (req: Request<{ userId: string }>, res: Response) => {
		const { userId } = req.params;

		const [updated] = await db
			.update(reportSetting)
			.set({
				isEnabled: true,
				nextReportDate: new Date(), // set to NOW so the job picks it up
			})
			.where(eq(reportSetting.userId, userId))
			.returning();

		if (!updated) {
			res.status(404).json({
				message:
					"No reportSetting found for this userId. Call PUT /api/report/update-setting first.",
			});
			return;
		}

		res.json({
			message:
				"nextReportDate set to now — call POST /api/admin/run/report-job to trigger",
			reportSetting: updated,
		});
	},
);

/**
 * PATCH /api/admin/transaction/:id/set-recurring-date
 *
 * Force-sets nextRecurringDate on a transaction for recurring-job testing.
 *
 * Body: { "nextRecurringDate": "2026-03-03T00:10:00.000Z" }
 */
adminRoutes.patch(
	"/transaction/:id/set-recurring-date",
	async (req: Request<{ id: string }>, res: Response) => {
		const id = req.params.id as string;
		const { nextRecurringDate } = req.body;

		if (!nextRecurringDate) {
			res
				.status(400)
				.json({ message: "nextRecurringDate is required in body" });
			return;
		}

		const parsed = new Date(nextRecurringDate);
		if (Number.isNaN(parsed.getTime())) {
			res.status(400).json({ message: "Invalid date format" });
			return;
		}

		const [updated] = await db
			.update(transaction)
			.set({ nextRecurringDate: parsed })
			.where(eq(transaction.id, id))
			.returning();

		if (!updated) {
			res.status(404).json({ message: "Transaction not found" });
			return;
		}

		res.json({
			message: "nextRecurringDate updated successfully",
			transaction: updated,
		});
	},
);

export default adminRoutes;
