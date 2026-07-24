import { randomUUID } from "crypto";
import {
	addWeeks,
	endOfWeek,
	format,
	startOfWeek,
} from "date-fns";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { generateAgentInsights } from "../ai/agent.insights.js";
import type { ReportType } from "../@types/report.type.js";
import { HTTPSTATUS } from "../configs/http.config.js";
import { db } from "../db/db.js";
import {
	ReportFrequencyEnum,
	ReportStatusEnum,
	budget,
	category,
	report,
	reportSetting,
	TransactionTypeEnum,
	transaction,
	user,
} from "../db/schema/index.js";
import { APIError } from "../lib/apiError.js";
import {
	calculateSavingRate,
	convertToDollarUnit,
} from "../lib/format.currency.js";
import { calulateNextReportDate } from "../lib/helper.js";
import { sendReportEmail } from "../mailers/report.mailer.js";
import type { UpdateReportSettingType } from "../validators/report.validator.js";

/** Stored inside `report.emailContent` for resend without regeneration. */
type StoredReportEmailPayload = {
	email: string;
	username: string;
	frequency: string;
	report: ReportType;
};

// ── Get All Reports ─────────────────────────────────────────────────────────────

/**
 * Returns a paginated list of previously generated reports for the user.
 * Email content is included in the DB row but the frontend should not render it.
 */
export const getAllReportsService = async (
	userId: string,
	pagination: { pageSize: number; pageNumber: number },
) => {
	const { pageSize, pageNumber } = pagination;
	const skip = (pageNumber - 1) * pageSize;
	const whereClause = eq(report.userId, userId);

	const [reports, countResult, statusRows] = await Promise.all([
		db
			.select({
				id: report.id,
				userId: report.userId,
				period: report.period,
				sentDate: report.sentDate,
				status: report.status,
				createdAt: report.createdAt,
				updatedAt: report.updatedAt,
				// emailContent intentionally omitted from list responses
			})
			.from(report)
			.where(whereClause)
			.orderBy(desc(report.createdAt))
			.limit(pageSize)
			.offset(skip),
		db.select({ totalCount: count() }).from(report).where(whereClause),
		db
			.select({ status: report.status, total: count() })
			.from(report)
			.where(whereClause)
			.groupBy(report.status),
	]);

	const totalCount = countResult[0]?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize) || 1;

	const statusCounts = {
		total: totalCount,
		sent: 0,
		failed: 0,
		pending: 0,
		noActivity: 0,
	};

	for (const row of statusRows) {
		if (row.status === ReportStatusEnum.SENT) statusCounts.sent = row.total;
		else if (row.status === ReportStatusEnum.FAILED)
			statusCounts.failed = row.total;
		else if (row.status === ReportStatusEnum.PENDING)
			statusCounts.pending = row.total;
		else if (row.status === ReportStatusEnum.NO_ACTIVITY)
			statusCounts.noActivity = row.total;
	}

	return {
		reports,
		total: totalCount,
		pageNumber,
		pageSize,
		totalPages,
		statusCounts,
		pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
	};
};

// ── Build report payload (no side effects) ──────────────────────────────────────

/**
 * Aggregates transactions, budget usage, and AI insights for a date range.
 * Returns `null` when there is no activity in the period.
 */
export const buildReportPayloadService = async (
	userId: string,
	fromDate: Date,
	toDate: Date,
): Promise<ReportType | null> => {
	const transactions = await db
		.select({
			title: transaction.title,
			type: transaction.type,
			amount: transaction.amount,
			date: transaction.date,
			categoryName: category.name,
			categoryId: transaction.categoryId,
		})
		.from(transaction)
		.innerJoin(category, eq(transaction.categoryId, category.id))
		.where(
			and(
				eq(transaction.userId, userId),
				gte(transaction.date, fromDate),
				lte(transaction.date, toDate),
			),
		)
		.orderBy(desc(transaction.date));

	if (!transactions.length) return null;

	let totalIncome = 0;
	let totalExpenses = 0;
	const categoryMap: Record<string, number> = {};

	for (const tx of transactions) {
		const amount = Math.abs(tx.amount);
		if (tx.type === TransactionTypeEnum.INCOME) {
			totalIncome += amount;
		} else if (tx.type === TransactionTypeEnum.EXPENSE) {
			totalExpenses += amount;
			categoryMap[tx.categoryName] =
				(categoryMap[tx.categoryName] ?? 0) + amount;
		}
	}

	if (totalIncome === 0 && totalExpenses === 0) return null;

	const topCategories = Object.entries(categoryMap)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5);

	const byCategory = topCategories.reduce(
		(acc, [catName, total]) => {
			acc[catName] = {
				amount: convertToDollarUnit(total),
				percentage:
					totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
			};
			return acc;
		},
		{} as Record<string, { amount: number; percentage: number }>,
	);

	const availableBalance = totalIncome - totalExpenses;
	const savingsRate = calculateSavingRate(totalIncome, totalExpenses);
	const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

	// Budget breakdown: spend in period vs budgeted limit per category
	const budgets = await db
		.select({
			categoryName: category.name,
			budgetAmount: budget.amount,
			categoryId: budget.categoryId,
		})
		.from(budget)
		.innerJoin(category, eq(budget.categoryId, category.id))
		.where(eq(budget.userId, userId));

	const budgetBreakdown = await Promise.all(
		budgets.map(async (row) => {
			const [spendRow] = await db
				.select({
					spent: sum(sql`ABS(${transaction.amount})`).mapWith(Number),
				})
				.from(transaction)
				.where(
					and(
						eq(transaction.userId, userId),
						eq(transaction.categoryId, row.categoryId),
						eq(transaction.type, TransactionTypeEnum.EXPENSE),
						gte(transaction.date, fromDate),
						lte(transaction.date, toDate),
					),
				);

			const spentCents = spendRow?.spent ?? 0;
			const budgeted = convertToDollarUnit(row.budgetAmount);
			const spent = convertToDollarUnit(spentCents);
			const percentUsed =
				budgeted > 0 ? Number(((spent / budgeted) * 100).toFixed(1)) : 0;

			return {
				categoryName: row.categoryName,
				spent: Number(spent.toFixed(2)),
				budgeted,
				percentUsed,
			};
		}),
	);

	const insights = await generateAgentInsights({
		totalIncome,
		totalExpenses,
		availableBalance,
		savingsRate,
		categories: byCategory,
		periodLabel,
	});

	const topCategoriesArray = Object.entries(byCategory).map(([name, cat]) => ({
		name,
		amount: cat.amount,
		percent: cat.percentage,
	}));

	return {
		period: periodLabel,
		totalIncome: convertToDollarUnit(totalIncome),
		totalExpenses: convertToDollarUnit(totalExpenses),
		availableBalance: convertToDollarUnit(availableBalance),
		savingsRate: Number(savingsRate.toFixed(1)),
		topSpendingCategories: topCategoriesArray,
		budgetBreakdown,
		transactions: transactions.map((tx) => ({
			title: tx.title,
			categoryName: tx.categoryName,
			type: tx.type,
			amount: convertToDollarUnit(Math.abs(tx.amount)),
			date: tx.date.toISOString(),
		})),
		insights: Array.isArray(insights)
			? insights.map((item) =>
					typeof item === "string" ? item : JSON.stringify(item),
				)
			: [],
	};
};

// ── Generate + deliver (API / Inngest shared path) ──────────────────────────────

type DeliverParams = {
	userId: string;
	email: string;
	username: string;
	frequency: string;
	fromDate: Date;
	toDate: Date;
};

/**
 * Builds the report, emails it, and persists a history row with SENT/FAILED status.
 * Stores the full email payload in `emailContent` for later resend.
 */
export const generateAndDeliverReportService = async (params: DeliverParams) => {
	const { userId, email, username, frequency, fromDate, toDate } = params;

	const reportPayload = await buildReportPayloadService(
		userId,
		fromDate,
		toDate,
	);

	if (!reportPayload) {
		const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;
		await db.insert(report).values({
			id: randomUUID(),
			userId,
			period: periodLabel,
			sentDate: new Date(),
			status: ReportStatusEnum.NO_ACTIVITY,
			emailContent: null,
		});

		await db
			.update(reportSetting)
			.set({ lastSentDate: new Date() })
			.where(eq(reportSetting.userId, userId));

		return { delivered: false, status: ReportStatusEnum.NO_ACTIVITY };
	}

	const storedPayload: StoredReportEmailPayload = {
		email,
		username,
		frequency,
		report: reportPayload,
	};

	let emailSent = false;
	try {
		await sendReportEmail({
			email,
			username,
			report: reportPayload,
			frequency,
		});
		emailSent = true;
	} catch (emailError) {
		console.error(
			`[generateAndDeliverReportService] Email failed for user ${userId}:`,
			emailError,
		);
	}

	const status = emailSent ? ReportStatusEnum.SENT : ReportStatusEnum.FAILED;

	await db.insert(report).values({
		id: randomUUID(),
		userId,
		period: reportPayload.period,
		sentDate: new Date(),
		status,
		emailContent: JSON.stringify(storedPayload),
	});

	await db
		.update(reportSetting)
		.set({
			...(emailSent ? { lastSentDate: new Date() } : {}),
			nextReportDate:
				frequency === ReportFrequencyEnum.WEEKLY
					? addWeeks(startOfWeek(new Date(), { weekStartsOn: 0 }), 1)
					: calulateNextReportDate(new Date(), 1),
		})
		.where(eq(reportSetting.userId, userId));

	return {
		delivered: emailSent,
		status,
		period: reportPayload.period,
		summary: {
			income: reportPayload.totalIncome,
			expenses: reportPayload.totalExpenses,
			balance: reportPayload.availableBalance,
			savingsRate: reportPayload.savingsRate,
			topCategories: reportPayload.topSpendingCategories,
		},
		insights: reportPayload.insights,
	};
};

/**
 * Manual generate endpoint — uses the user's setting email (or signup email).
 */
export const generateReportService = async (
	userId: string,
	fromDate: Date,
	toDate: Date,
) => {
	const [userRecord] = await db
		.select({ email: user.email, name: user.name })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!userRecord) {
		throw new APIError(HTTPSTATUS.NOT_FOUND, "User not found");
	}

	const [setting] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);

	return generateAndDeliverReportService({
		userId,
		email: setting?.email ?? userRecord.email,
		username: userRecord.name,
		frequency: setting?.frequency ?? ReportFrequencyEnum.MONTHLY,
		fromDate,
		toDate,
	});
};

// ── Update Report Setting ───────────────────────────────────────────────────────

/**
 * Creates or updates the report scheduling setting for the authenticated user.
 */
export const updateReportSettingService = async (
	userId: string,
	body: UpdateReportSettingType,
) => {
	const { isEnabled, dayOfMonth, frequency, email } = body;

	const [existingReportSetting] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);

	const resolvedDay = dayOfMonth ?? existingReportSetting?.dayOfMonth ?? 1;
	const resolvedFrequency =
		frequency ?? existingReportSetting?.frequency ?? ReportFrequencyEnum.MONTHLY;
	const enabled =
		isEnabled ?? existingReportSetting?.isEnabled ?? false;

	let nextReportDate: Date | null = null;
	if (enabled) {
		if (resolvedFrequency === ReportFrequencyEnum.WEEKLY) {
			// Next Sunday (week starts Sunday for "send every Sunday")
			const now = new Date();
			const thisSunday = endOfWeek(now, { weekStartsOn: 0 });
			nextReportDate =
				thisSunday > now
					? thisSunday
					: addWeeks(startOfWeek(now, { weekStartsOn: 0 }), 1);
		} else {
			nextReportDate = calulateNextReportDate(
				existingReportSetting?.lastSentDate ?? undefined,
				resolvedDay,
			);
		}
	}

	if (!existingReportSetting) {
		await db.insert(reportSetting).values({
			id: randomUUID(),
			userId,
			isEnabled: enabled,
			frequency: resolvedFrequency,
			dayOfMonth: resolvedDay,
			email: email === undefined ? null : email,
			nextReportDate,
		});
	} else {
		await db
			.update(reportSetting)
			.set({
				...(isEnabled !== undefined && { isEnabled }),
				...(frequency !== undefined && { frequency }),
				...(dayOfMonth !== undefined && { dayOfMonth: resolvedDay }),
				...(email !== undefined && { email }),
				nextReportDate,
			})
			.where(eq(reportSetting.userId, userId));
	}

	const [updated] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);

	return updated;
};

/** Fetches the current report setting (or null if not configured). */
export const getReportSettingService = async (userId: string) => {
	const [setting] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);
	return setting ?? null;
};

// ── Resend Report ───────────────────────────────────────────────────────────────

/**
 * Re-sends a previously stored report email payload.
 * Does not regenerate AI insights or re-query transactions.
 */
export const resendReportService = async (userId: string, reportId: string) => {
	const [existingReport] = await db
		.select()
		.from(report)
		.where(and(eq(report.id, reportId), eq(report.userId, userId)))
		.limit(1);

	if (!existingReport) {
		throw new APIError(HTTPSTATUS.NOT_FOUND, "Report not found");
	}

	if (!existingReport.emailContent) {
		throw new APIError(
			HTTPSTATUS.BAD_REQUEST,
			"This report has no stored email content to resend",
		);
	}

	let payload: StoredReportEmailPayload;
	try {
		payload = JSON.parse(existingReport.emailContent) as StoredReportEmailPayload;
	} catch {
		throw new APIError(
			HTTPSTATUS.BAD_REQUEST,
			"Stored report content is invalid",
		);
	}

	// Prefer the latest setting override email if present
	const [setting] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);

	const [userRecord] = await db
		.select({ email: user.email })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const recipient =
		setting?.email ?? userRecord?.email ?? payload.email;

	try {
		await sendReportEmail({
			email: recipient,
			username: payload.username,
			report: payload.report,
			frequency: payload.frequency,
		});
	} catch (error) {
		await db
			.update(report)
			.set({ status: ReportStatusEnum.FAILED })
			.where(eq(report.id, reportId));
		throw new APIError(
			HTTPSTATUS.INTERNAL_SERVER_ERROR,
			error instanceof Error ? error.message : "Failed to resend report email",
		);
	}

	await db
		.update(report)
		.set({ status: ReportStatusEnum.SENT, sentDate: new Date() })
		.where(eq(report.id, reportId));

	return { resent: true };
};
