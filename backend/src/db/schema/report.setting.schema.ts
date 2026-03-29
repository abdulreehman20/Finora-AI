import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user.schema";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const reportFrequencyEnum = pgEnum("report_frequency", ["MONTHLY"]);
export const ReportFrequencyEnum = { MONTHLY: "MONTHLY" } as const;

export type ReportFrequency = (typeof reportFrequencyEnum.enumValues)[number];

// ── Table ──────────────────────────────────────────────────────────────────────

/**
 * Stores per-user report scheduling preferences.
 *
 * - `isEnabled`   – whether automated monthly reports are active.
 * - `dayOfMonth`  – day (1–28) on which the monthly report is sent.
 *                   Capped at 28 so it always exists in every month.
 * - `nextReportDate` – next scheduled run date (recalculated after each send).
 * - `lastSentDate`   – timestamp of the last successful report delivery.
 */
export const reportSetting = pgTable(
	"report_setting",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		frequency: reportFrequencyEnum("frequency").default("MONTHLY").notNull(),

		/** Whether this user has opted in to automated monthly reports. */
		isEnabled: boolean("is_enabled").default(false).notNull(),

		/**
		 * Day of the month (1–28) on which the monthly report cron fires.
		 * Defaults to the 1st of the month.
		 */
		dayOfMonth: integer("day_of_month").default(1).notNull(),

		/** Pre-calculated timestamp of the next scheduled report run. */
		nextReportDate: timestamp("next_report_date"),

		/** Timestamp of the last successfully delivered report. */
		lastSentDate: timestamp("last_sent_date"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("report_setting_user_id_idx").on(table.userId)],
);

// ── Relations ─────────────────────────────────────────────────────────────────

export const reportSettingRelations = relations(reportSetting, ({ one }) => ({
	user: one(user, {
		fields: [reportSetting.userId],
		references: [user.id],
	}),
}));
