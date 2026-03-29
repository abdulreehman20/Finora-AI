import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account.schema";
import { report } from "./report.schema";
import { reportSetting } from "./report.setting.schema";
import { session } from "./session.schema";
import { transaction } from "./transaction.schema";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	username: text("username").unique(),
	displayUsername: text("display_username"),
	stripeCustomerId: text("stripe_customer_id"),
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	reports: many(report),
	reportSettings: many(reportSetting),
	transactions: many(transaction),
}));
