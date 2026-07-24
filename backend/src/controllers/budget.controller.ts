import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import {
	analyzeBudgetsService,
	createBudgetService,
	deleteBudgetService,
	getAllBudgetsService,
	getBudgetByIdService,
	updateBudgetService,
} from "../services/budget.service.js";
import {
	budgetIdSchema,
	createBudgetSchema,
	updateBudgetSchema,
} from "../validators/budget.validator.js";

export const getAllBudgetsController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const budgets = await getAllBudgetsService(userId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Budgets fetched successfully",
			budgets,
		});
	},
);

export const getBudgetByIdController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const budgetId = budgetIdSchema.parse(req.params.id);
		const budget = await getBudgetByIdService(userId, budgetId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Budget fetched successfully",
			budget,
		});
	},
);

export const createBudgetController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const body = createBudgetSchema.parse(req.body);
		const created = await createBudgetService(userId, body);

		return res.status(HTTPSTATUS.CREATED).json({
			message: "Budget created successfully",
			budget: created,
		});
	},
);

export const updateBudgetController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const budgetId = budgetIdSchema.parse(req.params.id);
		const body = updateBudgetSchema.parse(req.body);
		const updated = await updateBudgetService(userId, budgetId, body);

		return res.status(HTTPSTATUS.OK).json({
			message: "Budget updated successfully",
			budget: updated,
		});
	},
);

export const deleteBudgetController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const budgetId = budgetIdSchema.parse(req.params.id);
		await deleteBudgetService(userId, budgetId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Budget deleted successfully",
		});
	},
);

export const analyzeBudgetsController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const analyses = await analyzeBudgetsService(userId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Budgets analyzed successfully",
			analyses,
		});
	},
);
