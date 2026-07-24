import { z } from "zod";
import { BudgetPeriodEnum } from "../db/schema/budget.schema.js";

export const budgetIdSchema = z.string().trim().min(1);

export const createBudgetSchema = z.object({
	categoryId: z.string().trim().min(1, "Category is required"),
	amount: z.number().positive("Amount must be positive"),
	period: z.enum(
		[BudgetPeriodEnum.WEEKLY, BudgetPeriodEnum.MONTHLY] as const,
		{ message: "Period must be WEEKLY or MONTHLY" },
	),
});

/**
 * Partial update: amount edit from the UI, and/or aiAnalysis
 * persistence after running Analyze.
 */
export const updateBudgetSchema = z
	.object({
		amount: z.number().positive("Amount must be positive").optional(),
		aiAnalysis: z.string().trim().min(1).nullable().optional(),
	})
	.refine(
		(body) => body.amount !== undefined || body.aiAnalysis !== undefined,
		{ message: "At least one of amount or aiAnalysis is required" },
	);

export type CreateBudgetType = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetType = z.infer<typeof updateBudgetSchema>;
