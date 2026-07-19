import type { Request, Response } from "express";
import { runFinoraAgent } from "../ai/agent.js";
import { HTTPSTATUS } from "../configs/http.config.js";
import { APIError } from "../lib/apiError.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import {
  addChatMessage,
  buildSessionTitleFromMessage,
  deleteChatSession,
  ensureChatSession,
  getAgentMemoryMessages,
  getChatHistorySessions,
  getChatSessionMessages,
} from "../services/chat-history.service.js";
import {
  aiChatRequestSchema,
  aiSessionParamsSchema,
} from "../validators/ai-chat.validator.js";

export const chatWithAgentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const body = aiChatRequestSchema.parse(req.body);
    const sessionTitle =
      body.sessionId === undefined
        ? buildSessionTitleFromMessage(body.message)
        : undefined;
    const session = await ensureChatSession(
      userId,
      body.sessionId,
      sessionTitle,
    );
    if (!session) {
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Unable to initialize chat session" });
    }
    const history = await getAgentMemoryMessages(userId, session.id);

    await addChatMessage({
      sessionId: session.id,
      role: "user",
      content: body.message,
    });

    let result: Awaited<ReturnType<typeof runFinoraAgent>>;
    try {
      result = await runFinoraAgent({
        userId,
        message: body.message,
        history,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isRateLimited =
        message.includes("rate") ||
        message.includes("quota") ||
        message.includes("429") ||
        message.includes("resource exhausted");
      if (isRateLimited) {
        throw new APIError(
          HTTPSTATUS.TOO_MANY_REQUESTS,
          "You have reached today's limit. For further use, please wait 12 hours.",
        );
      }
      throw error;
    }

    await addChatMessage({
      sessionId: session.id,
      role: "assistant",
      content: result.text,
      toolCallMetadata: result.raw,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Agent response generated successfully",
      sessionId: session.id,
      title: session.title,
      response: result.text,
    });
  },
);

export const getAgentHistorySessionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const sessions = await getChatHistorySessions(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat sessions fetched successfully",
      sessions,
    });
  },
);

export const getAgentSessionHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const params = aiSessionParamsSchema.parse(req.params);
    const result = await getChatSessionMessages(userId, params.sessionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat session messages fetched successfully",
      sessionId: params.sessionId,
      session: result.session,
      messages: result.messages,
    });
  },
);

export const deleteAgentSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const params = aiSessionParamsSchema.parse(req.params);
    await deleteChatSession(userId, params.sessionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Session deleted successfully",
      sessionId: params.sessionId,
    });
  },
);
