import { Router } from "express";
import {
	createCategoryController,
	deleteCategoryController,
	getAllCategoriesController,
	updateCategoryController,
} from "../controllers/categories.controller.js";

const categoriesRoutes = Router();

categoriesRoutes.get("/", getAllCategoriesController);
categoriesRoutes.post("/", createCategoryController);
categoriesRoutes.put("/:id", updateCategoryController);
categoriesRoutes.delete("/:id", deleteCategoryController);

export default categoriesRoutes;
