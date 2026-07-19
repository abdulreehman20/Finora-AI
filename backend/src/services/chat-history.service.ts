import { randomUUID } from "crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import type { SessionMessage } from "../ai/session.store.js";
import { HTTPSTATUS } from "../configs/http.config.js";
import { db } from "../db/db.js";
import { chatHistory } from "../db/schema/chat.history.schema.js";
import { chatMessage } from "../db/schema/chat.message.schema.js";
import { APIError } from "../lib/apiError.js";

export async function ensureChatSession(
	userId: string,
	sessionId?: string,
	title?: string,
) {
	if (sessionId) {
		const [existing] = await db
			.select()
			.from(chatHistory)
			.where(and(eq(chatHistory.id, sessionId), eq(chatHistory.userId, userId)))
			.limit(1);

		if (existing) return existing;
	}

	const id = sessionId ?? randomUUID();
	const [created] = await db
		.insert(chatHistory)
		.values({
			id,
			userId,
			title: title?.trim() || null,
		})
		.returning();

	return created;
}

export function buildSessionTitleFromMessage(message: string) {
	const normalized = message.replace(/\s+/g, " ").trim();
	if (!normalized) return "New conversation";

	const words = normalized.split(" ").slice(0, 8);
	const title = words.join(" ");
	return title.length > 60 ? `${title.slice(0, 57)}...` : title;
}

export async function getChatHistorySessions(userId: string) {
	const sessions = await db
		.select()
		.from(chatHistory)
		.where(eq(chatHistory.userId, userId))
		.orderBy(desc(chatHistory.updatedAt));

	return sessions;
}

export async function getChatSessionMessages(
	userId: string,
	sessionId: string,
) {
	const [session] = await db
		.select()
		.from(chatHistory)
		.where(and(eq(chatHistory.id, sessionId), eq(chatHistory.userId, userId)))
		.limit(1);

	if (!session) {
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Chat session not found");
	}

	const messages = await db
		.select()
		.from(chatMessage)
		.where(eq(chatMessage.sessionId, sessionId))
		.orderBy(asc(chatMessage.createdAt));

	return { session, messages };
}

export async function addChatMessage(params: {
	sessionId: string;
	role: "user" | "assistant";
	content: string;
	toolCallMetadata?: unknown;
}) {
	const [created] = await db
		.insert(chatMessage)
		.values({
			id: randomUUID(),
			sessionId: params.sessionId,
			role: params.role,
			content: params.content,
			toolCallMetadata: params.toolCallMetadata,
		})
		.returning();

	await db
		.update(chatHistory)
		.set({
			updatedAt: new Date(),
		})
		.where(eq(chatHistory.id, params.sessionId));

	return created;
}

export async function deleteChatSession(userId: string, sessionId: string) {
	const [deleted] = await db
		.delete(chatHistory)
		.where(and(eq(chatHistory.id, sessionId), eq(chatHistory.userId, userId)))
		.returning();

	if (!deleted) {
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Chat session not found");
	}

	return deleted;
}

export async function getAgentMemoryMessages(
	userId: string,
	sessionId: string,
) {
	const { messages } = await getChatSessionMessages(userId, sessionId);
	return messages.map(
		(item): SessionMessage => ({
			role: item.role,
			content: item.content,
			createdAt: item.createdAt.toISOString(),
		}),
	);
}
