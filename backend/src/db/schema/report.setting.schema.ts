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
import { user } from "./user.schema.js";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const reportFrequencyEnum = pgEnum("report_frequency", [
	"WEEKLY",
	"MONTHLY",
]);
export const ReportFrequencyEnum = {
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
} as const;

export type ReportFrequency = (typeof reportFrequencyEnum.enumValues)[number];

// ── Table ──────────────────────────────────────────────────────────────────────

/**
 * Stores per-user report scheduling preferences.
 *
 * - `isEnabled`   – whether automated report emails are active.
 * - `frequency`   – WEEKLY (Sunday) or MONTHLY (1st of month).
 * - `email`       – optional override recipient (defaults to signup email).
 * - `dayOfMonth`  – kept for monthly scheduling metadata (defaults to 1).
 * - `nextReportDate` / `lastSentDate` – schedule bookkeeping.
 */
export const reportSetting = pgTable(
	"report_setting",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		frequency: reportFrequencyEnum("frequency").default("MONTHLY").notNull(),

		/** Whether this user has opted in to automated reports. */
		isEnabled: boolean("is_enabled").default(false).notNull(),

		/**
		 * Optional override email for report delivery.
		 * When null, the user's account signup email is used.
		 */
		email: text("email"),

		/**
		 * Day of the month (1–28) for monthly reports.
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
