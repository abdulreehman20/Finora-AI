import axios from "axios";
import { randomUUID } from "crypto";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { genAI, genAIModel } from "../ai/ai.config.js";
import { receiptPrompt } from "../ai/prompt.js";
import { HTTPSTATUS } from "../configs/http.config.js";
import { db } from "../db/db.js";
import { category } from "../db/schema/categories.schema.js";
import {
	TransactionTypeEnum,
	transaction,
} from "../db/schema/transaction.schema.js";
import { APIError } from "../lib/apiError.js";
import { calculateNextOccurrence } from "../lib/helper.js";
import {
	getCategoryByIdService,
	resolveCategoryIdsByNamesService,
} from "./categories.service.js";

import type {
	BulkTransactionItemType,
	CreateTransactionType,
	UpdateTransactionType,
} from "../validators/transaction.validator.js";

const transactionWithCategorySelect = {
	id: transaction.id,
	userId: transaction.userId,
	type: transaction.type,
	title: transaction.title,
	amount: transaction.amount,
	categoryId: transaction.categoryId,
	receiptUrl: transaction.receiptUrl,
	recurringInterval: transaction.recurringInterval,
	nextRecurringDate: transaction.nextRecurringDate,
	lastProcessed: transaction.lastProcessed,
	isRecurring: transaction.isRecurring,
	description: transaction.description,
	date: transaction.date,
	status: transaction.status,
	paymentMethod: transaction.paymentMethod,
	createdAt: transaction.createdAt,
	updatedAt: transaction.updatedAt,
	categoryName: category.name,
	categoryIcon: category.icon,
	categoryColor: category.color,
};

// Get All Transaction Service
export const getAllTransactionService = async (
	userId: string,
	filters: {
		keyword?: string;
		type?: keyof typeof TransactionTypeEnum;
		recurringStatus?: "RECURRING" | "NON_RECURRING";
		categoryId?: string;
	},
	pagination: {
		pageSize: number;
		pageNumber: number;
	},
) => {
	const { keyword, type, recurringStatus, categoryId } = filters;
	const { pageSize, pageNumber } = pagination;
	const skip = (pageNumber - 1) * pageSize;

	const conditions = [
		eq(transaction.userId, userId),
		...(keyword
			? [
					or(
						ilike(transaction.title, `%${keyword}%`),
						ilike(category.name, `%${keyword}%`),
					),
				]
			: []),
		...(type ? [eq(transaction.type, TransactionTypeEnum[type])] : []),
		...(categoryId ? [eq(transaction.categoryId, categoryId)] : []),
		...(recurringStatus === "RECURRING"
			? [eq(transaction.isRecurring, true)]
			: recurringStatus === "NON_RECURRING"
				? [eq(transaction.isRecurring, false)]
				: []),
	];

	const whereClause = and(...conditions);

	const [transactions, countResult] = await Promise.all([
		db
			.select(transactionWithCategorySelect)
			.from(transaction)
			.innerJoin(category, eq(transaction.categoryId, category.id))
			.where(whereClause)
			.orderBy(desc(transaction.createdAt))
			.limit(pageSize)
			.offset(skip),
		db
			.select({ totalCount: count() })
			.from(transaction)
			.innerJoin(category, eq(transaction.categoryId, category.id))
			.where(whereClause),
	]);

	const totalCount = countResult[0]?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	return {
		transactions: transactions.map((tx) => ({
			id: tx.id,
			userId: tx.userId,
			type: tx.type,
			title: tx.title,
			amount: tx.amount,
			categoryId: tx.categoryId,
			category: tx.categoryName,
			categoryIcon: tx.categoryIcon,
			categoryColor: tx.categoryColor,
			receiptUrl: tx.receiptUrl,
			recurringInterval: tx.recurringInterval,
			nextRecurringDate: tx.nextRecurringDate,
			lastProcessed: tx.lastProcessed,
			isRecurring: tx.isRecurring,
			description: tx.description,
			date: tx.date,
			status: tx.status,
			paymentMethod: tx.paymentMethod,
			createdAt: tx.createdAt,
			updatedAt: tx.updatedAt,
		})),
		pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
	};
};

// Get Transaction By Id Service
export const getTransactionByIdService = async (
	userId: string,
	transactionId: string,
) => {
	const [found] = await db
		.select(transactionWithCategorySelect)
		.from(transaction)
		.innerJoin(category, eq(transaction.categoryId, category.id))
		.where(
			and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
		)
		.limit(1);

	if (!found) throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

	return {
		id: found.id,
		userId: found.userId,
		type: found.type,
		title: found.title,
		amount: found.amount,
		categoryId: found.categoryId,
		category: found.categoryName,
		categoryIcon: found.categoryIcon,
		categoryColor: found.categoryColor,
		receiptUrl: found.receiptUrl,
		recurringInterval: found.recurringInterval,
		nextRecurringDate: found.nextRecurringDate,
		lastProcessed: found.lastProcessed,
		isRecurring: found.isRecurring,
		description: found.description,
		date: found.date,
		status: found.status,
		paymentMethod: found.paymentMethod,
		createdAt: found.createdAt,
		updatedAt: found.updatedAt,
	};
};

// Create Transaction Service
export const createTransactionService = async (
	body: CreateTransactionType,
	userId: string,
) => {
	await getCategoryByIdService(userId, body.categoryId);

	let nextRecurringDate: Date | undefined;
	const currentDate = new Date();

	if (body.isRecurring && body.recurringInterval) {
		const calulatedDate = calculateNextOccurrence(
			body.date,
			body.recurringInterval,
		);

		nextRecurringDate =
			calulatedDate < currentDate
				? calculateNextOccurrence(currentDate, body.recurringInterval)
				: calulatedDate;
	}

	const [created] = await db
		.insert(transaction)
		.values({
			id: randomUUID(),
			userId,
			title: body.title,
			description: body.description,
			type: body.type,
			amount: Number(body.amount),
			categoryId: body.categoryId,
			date: body.date,
			isRecurring: body.isRecurring ?? false,
			recurringInterval: body.recurringInterval ?? null,
			nextRecurringDate,
			lastProcessed: null,
			paymentMethod: body.paymentMethod,
			status: "COMPLETED",
		})
		.returning();

	if (!created)
		throw new APIError(HTTPSTATUS.INTERNAL_SERVER_ERROR, "Failed to create transaction");

	return getTransactionByIdService(userId, created.id);
};

// Update Transaction Service
export const updateTransactionService = async (
	userId: string,
	transactionId: string,
	body: UpdateTransactionType,
) => {
	const [existingTransaction] = await db
		.select()
		.from(transaction)
		.where(
			and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
		)
		.limit(1);

	if (!existingTransaction)
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

	if (body.categoryId) {
		await getCategoryByIdService(userId, body.categoryId);
	}

	const now = new Date();
	const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;
	const date =
		body.date !== undefined ? new Date(body.date) : existingTransaction.date;
	const recurringInterval =
		body.recurringInterval ?? existingTransaction.recurringInterval;

	let nextRecurringDate: Date | null = null;

	if (isRecurring && recurringInterval) {
		const calculatedDate = calculateNextOccurrence(date, recurringInterval);
		nextRecurringDate =
			calculatedDate < now
				? calculateNextOccurrence(now, recurringInterval)
				: calculatedDate;
	}

	await db
		.update(transaction)
		.set({
			...(body.title !== undefined && { title: body.title }),
			...(body.description !== undefined && { description: body.description }),
			...(body.categoryId !== undefined && { categoryId: body.categoryId }),
			...(body.type !== undefined && { type: body.type }),
			...(body.paymentMethod !== undefined && {
				paymentMethod: body.paymentMethod,
			}),
			...(body.amount !== undefined && { amount: Number(body.amount) }),
			date,
			isRecurring,
			recurringInterval: recurringInterval ?? null,
			nextRecurringDate,
		})
		.where(
			and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
		);

	return;
};

// Duplicate Transaction Service
export const duplicateTransactionService = async (
	userId: string,
	transactionId: string,
) => {
	const [existing] = await db
		.select()
		.from(transaction)
		.where(
			and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
		)
		.limit(1);

	if (!existing)
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

	const [duplicated] = await db
		.insert(transaction)
		.values({
			id: randomUUID(),
			userId: existing.userId,
			type: existing.type,
			title: `Duplicate - ${existing.title}`,
			amount: existing.amount,
			categoryId: existing.categoryId,
			receiptUrl: existing.receiptUrl,
			description: existing.description
				? `${existing.description} (Duplicate)`
				: "Duplicated transaction",
			date: existing.date,
			status: existing.status,
			paymentMethod: existing.paymentMethod,
			isRecurring: false,
			recurringInterval: null,
			nextRecurringDate: null,
			lastProcessed: null,
		})
		.returning();

	if (!duplicated)
		throw new APIError(HTTPSTATUS.INTERNAL_SERVER_ERROR, "Failed to duplicate transaction");

	return getTransactionByIdService(userId, duplicated.id);
};

// Delete Transaction Service
export const deleteTransactionService = async (
	userId: string,
	transactionId: string,
) => {
	const [deleted] = await db
		.delete(transaction)
		.where(
			and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
		)
		.returning();

	if (!deleted)
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

	return;
};

// Scan Receipt Service
export const scanReceiptService = async (
	file: Express.Multer.File | undefined,
) => {
	if (!file) throw new APIError(HTTPSTATUS.BAD_REQUEST, "No file uploaded");

	try {
		if (!file.path)
			throw new APIError(HTTPSTATUS.BAD_REQUEST, "Failed to upload file");

		const responseData = await axios.get(file.path, {
			responseType: "arraybuffer",
		});
		const base64String = Buffer.from(responseData.data).toString("base64");

		if (!base64String)
			throw new APIError(HTTPSTATUS.BAD_REQUEST, "Could not process file");

		const result = await genAI.models.generateContent({
			model: genAIModel,
			contents: [
				{
					role: "user",
					parts: [
						{ text: receiptPrompt },
						{ inlineData: { mimeType: file.mimetype, data: base64String } },
					],
				},
			],
			config: { temperature: 0, topP: 1, responseMimeType: "application/json" },
		});

		const response = result.text;

		const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
		if (!cleanedText) return { error: "Could not read receipt content" };

		const data = JSON.parse(cleanedText);
		if (!data.amount || !data.date)
			return { error: "Receipt missing required information" };

		return {
			title: data.title || "Receipt",
			amount: data.amount,
			date: data.date,
			description: data.description,
			category: data.category,
			paymentMethod: data.paymentMethod,
			type: data.type,
			receiptUrl: file.path,
		};
	} catch (error) {
		if (error instanceof APIError) throw error;
		return { error: "Receipt scanning service unavailable" };
	}
};

// Bulk Transaction Service
export const bulkTransactionService = async (
	userId: string,
	txList: BulkTransactionItemType[],
) => {
	const categoryNames = txList.map((tx) => tx.category);
	const resolvedMap = await resolveCategoryIdsByNamesService(
		userId,
		categoryNames,
	);

	const now = new Date();

	const rows = txList.map((tx) => {
		let nextRecurringDate: Date | null = null;

		if (tx.isRecurring && tx.recurringInterval) {
			const calculated = calculateNextOccurrence(tx.date, tx.recurringInterval);
			nextRecurringDate =
				calculated < now
					? calculateNextOccurrence(now, tx.recurringInterval)
					: calculated;
		}

		const categoryId = resolvedMap.get(tx.category.trim());
		if (!categoryId) {
			throw new APIError(
				HTTPSTATUS.BAD_REQUEST,
				`Unknown category: ${tx.category}`,
			);
		}

		return {
			id: randomUUID(),
			userId,
			title: tx.title,
			description: tx.description ?? null,
			type: tx.type,
			amount: Number(tx.amount),
			categoryId,
			date: tx.date,
			isRecurring: tx.isRecurring ?? false,
			recurringInterval: tx.recurringInterval ?? null,
			nextRecurringDate,
			lastProcessed: null,
			paymentMethod: tx.paymentMethod,
			status: "COMPLETED" as const,
		};
	});

	const inserted = await db.insert(transaction).values(rows).returning();

	return { insertedCount: inserted.length, success: true };
};

// Bulk Delete Transaction Service
export const bulkDeleteTransactionService = async (
	userId: string,
	transactionIds: string[],
) => {
	const deleted = await db
		.delete(transaction)
		.where(
			and(
				eq(transaction.userId, userId),
				inArray(transaction.id, transactionIds),
			),
		)
		.returning();

	if (deleted.length === 0)
		throw new APIError(HTTPSTATUS.NOT_FOUND, "No transactions found");

	return { success: true, deletedCount: deleted.length };
};
