import { z } from "zod";
import { CategoryTypeEnum } from "../db/schema/categories.schema.js";

export const categoryIdSchema = z.string().trim().min(1);

export const createCategorySchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(100),
	type: z.enum([CategoryTypeEnum.INCOME, CategoryTypeEnum.EXPENSE] as const, {
		message: "Type must be INCOME or EXPENSE",
	}),
	icon: z.string().trim().min(1, "Icon is required"),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
