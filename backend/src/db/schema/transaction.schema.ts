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

export const transactionStatusEnum = pgEnum("transaction_status", [
	"PENDING",
	"COMPLETED",
	"FAILED",
]);
export const recurringIntervalEnum = pgEnum("recurring_interval", [
	"DAILY",
	"WEEKLY",
	"MONTHLY",
	"YEARLY",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
	"INCOME",
	"EXPENSE",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
	"CARD",
	"BANK_TRANSFER",
	"MOBILE_PAYMENT",
	"AUTO_DEBIT",
	"CASH",
	"OTHER",
]);

export const TransactionStatusEnum = {
	PENDING: "PENDING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
} as const;
export const RecurringIntervalEnum = {
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY",
} as const;
export const TransactionTypeEnum = {
	INCOME: "INCOME",
	EXPENSE: "EXPENSE",
} as const;
export const PaymentMethodEnum = {
	CARD: "CARD",
	BANK_TRANSFER: "BANK_TRANSFER",
	MOBILE_PAYMENT: "MOBILE_PAYMENT",
	AUTO_DEBIT: "AUTO_DEBIT",
	CASH: "CASH",
	OTHER: "OTHER",
} as const;

export type TransactionStatus =
	(typeof transactionStatusEnum.enumValues)[number];
export type RecurringInterval =
	(typeof recurringIntervalEnum.enumValues)[number];
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const transaction = pgTable(
	"transaction",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: transactionTypeEnum("type").notNull(),
		title: text("title").notNull(),
		amount: integer("amount").notNull(), // stored in cents
		category: text("category").notNull(),
		receiptUrl: text("receipt_url"),
		recurringInterval: recurringIntervalEnum("recurring_interval"),
		nextRecurringDate: timestamp("next_recurring_date"),
		lastProcessed: timestamp("last_processed"),
		isRecurring: boolean("is_recurring").default(false).notNull(),
		description: text("description"),
		date: timestamp("date").defaultNow().notNull(),
		status: transactionStatusEnum("status").default("COMPLETED").notNull(),
		paymentMethod: paymentMethodEnum("payment_method")
			.default("CASH")
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("transaction_user_id_idx").on(table.userId)],
);

export const transactionRelations = relations(transaction, ({ one }) => ({
	user: one(user, {
		fields: [transaction.userId],
		references: [user.id],
	}),
}));
