import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import {
	createCategoryService,
	deleteCategoryService,
	getAllCategoriesService,
	updateCategoryService,
} from "../services/categories.service.js";
import {
	categoryIdSchema,
	createCategorySchema,
	updateCategorySchema,
} from "../validators/categories.validator.js";

export const getAllCategoriesController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const categories = await getAllCategoriesService(userId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Categories fetched successfully",
			categories,
		});
	},
);

export const createCategoryController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const body = createCategorySchema.parse(req.body);
		const created = await createCategoryService(userId, body);

		return res.status(HTTPSTATUS.CREATED).json({
			message: "Category created successfully",
			category: created,
		});
	},
);

export const updateCategoryController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const categoryId = categoryIdSchema.parse(req.params.id);
		const body = updateCategorySchema.parse(req.body);
		const updated = await updateCategoryService(userId, categoryId, body);

		return res.status(HTTPSTATUS.OK).json({
			message: "Category updated successfully",
			category: updated,
		});
	},
);

export const deleteCategoryController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const categoryId = categoryIdSchema.parse(req.params.id);
		await deleteCategoryService(userId, categoryId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Category deleted successfully",
		});
	},
);
