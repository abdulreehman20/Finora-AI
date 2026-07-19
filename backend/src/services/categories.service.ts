import { randomUUID } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { HTTPSTATUS } from "../configs/http.config.js";
import { db } from "../db/db.js";
import {
	CategoryTypeEnum,
	category,
} from "../db/schema/categories.schema.js";
import { APIError } from "../lib/apiError.js";
import type {
	CreateCategoryType,
	UpdateCategoryType,
} from "../validators/categories.validator.js";

export const DEFAULT_CATEGORIES = [
	// Expense (7)
	{
		name: "Education",
		type: CategoryTypeEnum.EXPENSE,
		icon: "book",
		color: "#8B5CF6",
	},
	{
		name: "Entertainment",
		type: CategoryTypeEnum.EXPENSE,
		icon: "ticket",
		color: "#A855F7",
	},
	{
		name: "Food & Dining",
		type: CategoryTypeEnum.EXPENSE,
		icon: "tools-kitchen-2",
		color: "#F97316",
	},
	{
		name: "Rent",
		type: CategoryTypeEnum.EXPENSE,
		icon: "home",
		color: "#EF4444",
	},
	{
		name: "Personal Care",
		type: CategoryTypeEnum.EXPENSE,
		icon: "sparkles",
		color: "#EC4899",
	},
	{
		name: "Transportation",
		type: CategoryTypeEnum.EXPENSE,
		icon: "car",
		color: "#DC2626",
	},
	{
		name: "Travel",
		type: CategoryTypeEnum.EXPENSE,
		icon: "plane",
		color: "#FB923C",
	},
	// Income (5)
	{
		name: "Salary",
		type: CategoryTypeEnum.INCOME,
		icon: "cash",
		color: "#22C55E",
	},
	{
		name: "Freelance",
		type: CategoryTypeEnum.INCOME,
		icon: "device-laptop",
		color: "#16A34A",
	},
	{
		name: "Investments",
		type: CategoryTypeEnum.INCOME,
		icon: "trending-up",
		color: "#14B8A6",
	},
	{
		name: "Gifts",
		type: CategoryTypeEnum.INCOME,
		icon: "gift",
		color: "#38BDF8",
	},
	{
		name: "Other Income",
		type: CategoryTypeEnum.INCOME,
		icon: "circle-plus",
		color: "#3B82F6",
	},
] as const;

export const seedDefaultCategoriesService = async (userId: string) => {
	const rows = DEFAULT_CATEGORIES.map((cat) => ({
		id: randomUUID(),
		userId,
		name: cat.name,
		type: cat.type,
		icon: cat.icon,
		color: cat.color,
		isDefault: true,
	}));

	await db.insert(category).values(rows);
};

export const getAllCategoriesService = async (userId: string) => {
	const rows = await db
		.select()
		.from(category)
		.where(eq(category.userId, userId))
		.orderBy(asc(category.type), asc(category.name));

	if (rows.length === 0) {
		await seedDefaultCategoriesService(userId);
		return db
			.select()
			.from(category)
			.where(eq(category.userId, userId))
			.orderBy(asc(category.type), asc(category.name));
	}

	return rows;
};

export const getCategoryByIdService = async (
	userId: string,
	categoryId: string,
) => {
	const [found] = await db
		.select()
		.from(category)
		.where(and(eq(category.id, categoryId), eq(category.userId, userId)))
		.limit(1);

	if (!found) throw new APIError(HTTPSTATUS.NOT_FOUND, "Category not found");

	return found;
};

export const createCategoryService = async (
	userId: string,
	body: CreateCategoryType,
) => {
	const [created] = await db
		.insert(category)
		.values({
			id: randomUUID(),
			userId,
			name: body.name,
			type: body.type,
			icon: body.icon,
			color: body.color,
			isDefault: false,
		})
		.returning();

	return created;
};

export const updateCategoryService = async (
	userId: string,
	categoryId: string,
	body: UpdateCategoryType,
) => {
	const existing = await getCategoryByIdService(userId, categoryId);

	const [updated] = await db
		.update(category)
		.set({
			...(body.name !== undefined && { name: body.name }),
			...(body.type !== undefined && { type: body.type }),
			...(body.icon !== undefined && { icon: body.icon }),
			...(body.color !== undefined && { color: body.color }),
		})
		.where(
			and(eq(category.id, existing.id), eq(category.userId, userId)),
		)
		.returning();

	return updated;
};

export const deleteCategoryService = async (
	userId: string,
	categoryId: string,
) => {
	const [deleted] = await db
		.delete(category)
		.where(and(eq(category.id, categoryId), eq(category.userId, userId)))
		.returning();

	if (!deleted) throw new APIError(HTTPSTATUS.NOT_FOUND, "Category not found");

	return deleted;
};

export const resolveCategoryIdsByNamesService = async (
	userId: string,
	categoryNames: string[],
) => {
	const userCategories = await getAllCategoriesService(userId);
	const nameToId = new Map(
		userCategories.map((cat) => [cat.name.toLowerCase(), cat.id]),
	);

	const missing: string[] = [];
	const resolved = new Map<string, string>();

	for (const name of categoryNames) {
		const trimmed = name.trim();
		if (!trimmed) continue;
		const id = nameToId.get(trimmed.toLowerCase());
		if (!id) {
			missing.push(trimmed);
		} else {
			resolved.set(trimmed, id);
		}
	}

	if (missing.length > 0) {
		throw new APIError(
			HTTPSTATUS.BAD_REQUEST,
			`Unknown categories: ${missing.join(", ")}`,
		);
	}

	return resolved;
};
