import { z } from "zod";

// ── Report Setting Validator ───────────────────────────────────────────────────

export const reportSettingSchema = z.object({
	/**
	 * Enable (`true`) or disable (`false`) automated monthly email reports.
	 */
	isEnabled: z.boolean().default(true),

	/**
	 * Day of the month (1–28) on which the monthly report should be generated
	 * and emailed. Capped at 28 so the value is valid in every calendar month.
	 *
	 * Defaults to 1 (first of the month) when not supplied.
	 */
	dayOfMonth: z.number().int().min(1).max(28).default(1),
});

export const updateReportSettingSchema = reportSettingSchema.partial();

export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>;
