import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.schema";

export const reportStatusEnum = pgEnum("report_status", [
	"SENT",
	"PENDING",
	"FAILED",
	"NO_ACTIVITY",
]);

export const ReportStatusEnum = {
	SENT: "SENT",
	PENDING: "PENDING",
	FAILED: "FAILED",
	NO_ACTIVITY: "NO_ACTIVITY",
} as const;

export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];

export const report = pgTable(
	"report",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		period: text("period").notNull(),
		sentDate: timestamp("sent_date").notNull(),
		status: reportStatusEnum("status").default("PENDING").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("report_user_id_idx").on(table.userId)],
);

export const reportRelations = relations(report, ({ one }) => ({
	user: one(user, {
		fields: [report.userId],
		references: [user.id],
	}),
}));
