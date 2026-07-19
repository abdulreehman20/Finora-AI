import { relations } from "drizzle-orm";
import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { chatHistory } from "./chat.history.schema.js";

export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const chatMessage = pgTable(
	"chat_message",
	{
		id: text("id").primaryKey(),
		sessionId: text("session_id")
			.notNull()
			.references(() => chatHistory.id, { onDelete: "cascade" }),
		role: chatRoleEnum("role").notNull(),
		content: text("content").notNull(),
		toolCallMetadata: jsonb("tool_call_metadata"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("chat_message_session_id_idx").on(table.sessionId),
		index("chat_message_created_at_idx").on(table.createdAt),
	],
);

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
	session: one(chatHistory, {
		fields: [chatMessage.sessionId],
		references: [chatHistory.id],
	}),
}));
