import { Router } from "express";
import { getSubscriptionStatusController } from "../controllers/subscription.controller";

const subscriptionRoutes = Router();

/**
 * GET /api/subscription/status
 * Returns the authenticated user's current plan and feature limits.
 */
subscriptionRoutes.get("/status", getSubscriptionStatusController);

export default subscriptionRoutes;
