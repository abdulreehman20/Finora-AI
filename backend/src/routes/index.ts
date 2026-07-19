import { Router } from "express";
import agentRoutes from "./agent.route.js";
import aiRoutes from "./ai.route.js";
import analyticsRoutes from "./analytics.route.js";
import categoriesRoutes from "./categories.route.js";
import reportRoutes from "./report.route.js";
import subscriptionRoutes from "./subscription.route.js";
import transactionRoutes from "./transaction.route.js";

const router = Router();

router.use("/categories", categoriesRoutes);
router.use("/transaction", transactionRoutes);
router.use("/report", reportRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/ai", aiRoutes);
router.use("/agent", agentRoutes);

export default router;
