import { Router } from "express";
import {
	analyzeBudgetsController,
	createBudgetController,
	deleteBudgetController,
	getAllBudgetsController,
	getBudgetByIdController,
	updateBudgetController,
} from "../controllers/budget.controller.js";

const budgetRoutes = Router();

budgetRoutes.get("/", getAllBudgetsController);
budgetRoutes.post("/analyze", analyzeBudgetsController);
budgetRoutes.get("/:id", getBudgetByIdController);
budgetRoutes.post("/", createBudgetController);
budgetRoutes.put("/:id", updateBudgetController);
budgetRoutes.delete("/:id", deleteBudgetController);

export default budgetRoutes;
