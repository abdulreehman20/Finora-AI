import { z } from "zod";

export const aiChatRequestSchema = z.object({
	message: z.string().trim().min(1, "Message is required"),
	sessionId: z.string().trim().min(1).optional(),
});

export const aiSessionParamsSchema = z.object({
	sessionId: z.string().trim().min(1, "Session id is required"),
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
