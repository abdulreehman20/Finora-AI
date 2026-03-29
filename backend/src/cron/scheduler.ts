import cron from "node-cron";
import { processReportJob } from "./jobs/report.job";
import { processRecurringTransactions } from "./jobs/transaction.job";

// ── scheduleJob ───────────────────────────────────────────────────────────────

/**
 * Registers a named cron job with `node-cron`.
 *
 * @param name - Human-readable job label (used in logs).
 * @param time - Cron expression (standard 5-field format, UTC).
 * @param job  - Async function to execute on each trigger.
 */
const scheduleJob = (
	name: string,
	time: string,
	job: () => Promise<unknown>,
) => {
	console.log(`⏰ Scheduling "${name}" at cron time: ${time}`);

	return cron.schedule(
		time,
		async () => {
			console.log(`▶️  Running job: ${name}`);
			try {
				await job();
				console.log(`✅ Job completed: ${name}`);
			} catch (error) {
				console.error(`❌ Job failed: ${name}`, error);
			}
		},
		{ timezone: "UTC", name, noOverlap: true },
	);
};

// ── startJobs ─────────────────────────────────────────────────────────────────

/**
 * Registers and starts all application cron jobs.
 *
 * | Job                    | Schedule (UTC)              | Description                                    |
 * |------------------------|-----------------------------|------------------------------------------------|
 * | Recurring Transactions | `5 0 * * *` – daily 00:05  | Creates the next occurrence of recurring txns. |
 * | Monthly Reports        | `30 2 1 * *` – 1st 02:30   | Generates & emails enabled monthly reports.    |
 *
 * @returns Array of active `node-cron` task handles.
 */
export const startJobs = () => {
	return [
		// Runs at 00:05 UTC every day — processes due recurring transactions
		scheduleJob(
			"Recurring Transactions",
			"5 0 * * *",
			processRecurringTransactions,
		),

		// Runs at 02:30 UTC on the 1st of every month — fires monthly AI reports
		// The job itself filters by nextReportDate, so users with a different
		// dayOfMonth are skipped until their scheduled date.
		scheduleJob("Monthly Reports", "30 2 1 * *", processReportJob),
	];
};
