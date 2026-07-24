import { randomUUID } from "crypto";
import {
	endOfMonth,
	endOfWeek,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { and, asc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
	generateBudgetAnalyses,
	resolveBudgetTag,
} from "../ai/budget.analysis.js";
import { HTTPSTATUS } from "../configs/http.config.js";
import { db } from "../db/db.js";
import {
	BudgetPeriodEnum,
	budget,
	type BudgetPeriod,
} from "../db/schema/budget.schema.js";
import {
	CategoryTypeEnum,
	category,
} from "../db/schema/categories.schema.js";
import {
	TransactionTypeEnum,
	transaction,
} from "../db/schema/transaction.schema.js";
import { APIError } from "../lib/apiError.js";
import {
	convertToCents,
	convertToDollarUnit,
} from "../lib/format.currency.js";
import type {
	CreateBudgetType,
	UpdateBudgetType,
} from "../validators/budget.validator.js";

function getPeriodRange(period: BudgetPeriod) {
	const now = new Date();

	if (period === BudgetPeriodEnum.WEEKLY) {
		return {
			from: startOfWeek(now, { weekStartsOn: 1 }),
			to: endOfWeek(now, { weekStartsOn: 1 }),
		};
	}

	return {
		from: startOfMonth(now),
		to: endOfMonth(now),
	};
}

async function getCategorySpendInPeriod(
	userId: string,
	categoryId: string,
	period: BudgetPeriod,
) {
	const { from, to } = getPeriodRange(period);

	const [result] = await db
		.select({
			spent: sum(sql`ABS(${transaction.amount})`).mapWith(Number),
		})
		.from(transaction)
		.where(
			and(
				eq(transaction.userId, userId),
				eq(transaction.categoryId, categoryId),
				eq(transaction.type, TransactionTypeEnum.EXPENSE),
				gte(transaction.date, from),
				lte(transaction.date, to),
			),
		);

	return result?.spent ?? 0;
}

/** Maps a budget row + spend total into the API response shape (amounts in dollars). */
function toBudgetResponse(row: {
	id: string;
	userId: string;
	categoryId: string;
	amount: number;
	period: BudgetPeriod;
	aiAnalysis: string | null;
	createdAt: Date;
	updatedAt: Date;
	category: typeof category.$inferSelect;
	spentCents: number;
}) {
	const amount = convertToDollarUnit(row.amount);
	const spent = convertToDollarUnit(row.spentCents);
	const remaining = amount - spent;
	const percentUsed = amount > 0 ? (spent / amount) * 100 : 0;

	return {
		id: row.id,
		userId: row.userId,
		categoryId: row.categoryId,
		amount,
		period: row.period,
		aiAnalysis: row.aiAnalysis,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		category: row.category,
		spent: Number(spent.toFixed(2)),
		remaining: Number(remaining.toFixed(2)),
		percentUsed: Number(percentUsed.toFixed(2)),
	};
}

export const getAllBudgetsService = async (userId: string) => {
	const rows = await db
		.select({
			budget,
			category,
		})
		.from(budget)
		.innerJoin(category, eq(budget.categoryId, category.id))
		.where(eq(budget.userId, userId))
		.orderBy(asc(category.name));

	return Promise.all(
		rows.map(async ({ budget: budgetRow, category: categoryRow }) => {
			const spentCents = await getCategorySpendInPeriod(
				userId,
				budgetRow.categoryId,
				budgetRow.period,
			);

			return toBudgetResponse({
				...budgetRow,
				category: categoryRow,
				spentCents,
			});
		}),
	);
};

export const getBudgetByIdService = async (userId: string, budgetId: string) => {
	const [row] = await db
		.select({
			budget,
			category,
		})
		.from(budget)
		.innerJoin(category, eq(budget.categoryId, category.id))
		.where(and(eq(budget.id, budgetId), eq(budget.userId, userId)))
		.limit(1);

	if (!row) throw new APIError(HTTPSTATUS.NOT_FOUND, "Budget not found");

	const spentCents = await getCategorySpendInPeriod(
		userId,
		row.budget.categoryId,
		row.budget.period,
	);

	return toBudgetResponse({
		...row.budget,
		category: row.category,
		spentCents,
	});
};

export const createBudgetService = async (
	userId: string,
	body: CreateBudgetType,
) => {
	const [foundCategory] = await db
		.select()
		.from(category)
		.where(
			and(
				eq(category.id, body.categoryId),
				eq(category.userId, userId),
				eq(category.type, CategoryTypeEnum.EXPENSE),
			),
		)
		.limit(1);

	if (!foundCategory) {
		throw new APIError(
			HTTPSTATUS.BAD_REQUEST,
			"Expense category not found for this user",
		);
	}

	const [existing] = await db
		.select({ id: budget.id })
		.from(budget)
		.where(
			and(eq(budget.userId, userId), eq(budget.categoryId, body.categoryId)),
		)
		.limit(1);

	if (existing) {
		throw new APIError(
			HTTPSTATUS.CONFLICT,
			"A budget already exists for this category",
		);
	}

	const [created] = await db
		.insert(budget)
		.values({
			id: randomUUID(),
			userId,
			categoryId: body.categoryId,
			amount: convertToCents(body.amount),
			period: body.period,
		})
		.returning();

	if (!created) {
		throw new APIError(
			HTTPSTATUS.INTERNAL_SERVER_ERROR,
			"Failed to create budget",
		);
	}

	return getBudgetByIdService(userId, created.id);
};

/** Updates budget amount and/or persisted AI analysis text. */
export const updateBudgetService = async (
	userId: string,
	budgetId: string,
	body: UpdateBudgetType,
) => {
	const [existing] = await db
		.select()
		.from(budget)
		.where(and(eq(budget.id, budgetId), eq(budget.userId, userId)))
		.limit(1);

	if (!existing) throw new APIError(HTTPSTATUS.NOT_FOUND, "Budget not found");

	const [updated] = await db
		.update(budget)
		.set({
			...(body.amount !== undefined && {
				amount: convertToCents(body.amount),
			}),
			...(body.aiAnalysis !== undefined && {
				aiAnalysis: body.aiAnalysis,
			}),
		})
		.where(and(eq(budget.id, existing.id), eq(budget.userId, userId)))
		.returning();

	if (!updated) {
		throw new APIError(
			HTTPSTATUS.INTERNAL_SERVER_ERROR,
			"Failed to update budget",
		);
	}

	return getBudgetByIdService(userId, updated.id);
};

export const deleteBudgetService = async (userId: string, budgetId: string) => {
	const [deleted] = await db
		.delete(budget)
		.where(and(eq(budget.id, budgetId), eq(budget.userId, userId)))
		.returning();

	if (!deleted) throw new APIError(HTTPSTATUS.NOT_FOUND, "Budget not found");

	return deleted;
};

export const analyzeBudgetsService = async (userId: string) => {
	const budgets = await getAllBudgetsService(userId);

	if (budgets.length === 0) {
		return [];
	}

	const analysisInputs = budgets.map((item) => ({
		budgetId: item.id,
		categoryName: item.category.name,
		budgetLimit: item.amount,
		amountSpent: item.spent,
		percentUsed: item.percentUsed,
		tag: resolveBudgetTag(item.percentUsed),
		period: item.period,
	}));

	return generateBudgetAnalyses(analysisInputs);
};
