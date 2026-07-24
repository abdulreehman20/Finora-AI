import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { category } from "./categories.schema.js";
import { user } from "./user.schema.js";

export const budgetPeriodEnum = pgEnum("budget_period", ["WEEKLY", "MONTHLY"]);

export const BudgetPeriodEnum = {
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
} as const;

export type BudgetPeriod = (typeof budgetPeriodEnum.enumValues)[number];

export const budget = pgTable(
	"budget",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		categoryId: text("category_id")
			.notNull()
			.references(() => category.id, { onDelete: "cascade" }),
		amount: integer("amount").notNull(), // stored in cents
		period: budgetPeriodEnum("period").notNull(),
		/** Persisted LLM insight text returned by POST /budgets/analyze */
		aiAnalysis: text("ai_analysis"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("budget_user_id_idx").on(table.userId),
		uniqueIndex("budget_category_id_uidx").on(table.categoryId),
		uniqueIndex("budget_user_id_category_id_uidx").on(
			table.userId,
			table.categoryId,
		),
	],
);

export const budgetRelations = relations(budget, ({ one }) => ({
	user: one(user, {
		fields: [budget.userId],
		references: [user.id],
	}),
	category: one(category, {
		fields: [budget.categoryId],
		references: [category.id],
	}),
}));
