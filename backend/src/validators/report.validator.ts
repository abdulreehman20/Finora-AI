import { z } from "zod";
import { ReportFrequencyEnum } from "../db/schema/report.setting.schema.js";

// ── Report Setting Validator ───────────────────────────────────────────────────

export const reportSettingSchema = z.object({
	/** Enable (`true`) or disable (`false`) automated report emails. */
	isEnabled: z.boolean().default(true),

	/**
	 * Delivery cadence:
	 * - WEEKLY  → every Sunday
	 * - MONTHLY → 1st of each month
	 */
	frequency: z
		.enum([ReportFrequencyEnum.WEEKLY, ReportFrequencyEnum.MONTHLY] as const)
		.default(ReportFrequencyEnum.MONTHLY),

	/**
	 * Optional override recipient email.
	 * When omitted/null, the account signup email is used.
	 */
	email: z.string().email().nullable().optional(),

	/**
	 * Day of the month (1–28) for monthly reports metadata.
	 * Defaults to 1 (first of the month).
	 */
	dayOfMonth: z.number().int().min(1).max(28).default(1),
});

export const updateReportSettingSchema = reportSettingSchema.partial();

export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>;
