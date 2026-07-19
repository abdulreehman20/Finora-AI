import { Router } from "express";
import {
	chatWithAgentController,
	deleteAgentSessionController,
	getAgentSessionHistoryController,
} from "../controllers/ai.controller.js";

const aiRoutes = Router();

aiRoutes.post("/chat", chatWithAgentController);
aiRoutes.get("/session/:sessionId/messages", getAgentSessionHistoryController);
aiRoutes.delete("/session/:sessionId", deleteAgentSessionController);

export default aiRoutes;
