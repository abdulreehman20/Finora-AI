import { Router } from "express";
import {
	chatWithAgentController,
	deleteAgentSessionController,
	getAgentHistorySessionsController,
	getAgentSessionHistoryController,
} from "../controllers/ai.controller.js";

const agentRoutes = Router();

agentRoutes.post("/chat", chatWithAgentController);
agentRoutes.get("/history", getAgentHistorySessionsController);
agentRoutes.get("/history/:sessionId", getAgentSessionHistoryController);
agentRoutes.delete("/history/:sessionId", deleteAgentSessionController);

export default agentRoutes;
