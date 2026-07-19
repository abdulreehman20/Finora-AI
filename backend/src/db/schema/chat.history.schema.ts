import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.schema.js";

export const chatHistory = pgTable(
	"chat_history",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title"),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("chat_history_user_id_idx").on(table.userId)],
);

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
	user: one(user, {
		fields: [chatHistory.userId],
		references: [user.id],
	}),
}));
