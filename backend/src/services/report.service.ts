import { format } from "date-fns";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { generateInsightsAI } from "../ai-prompt/aI.insights";

import { db } from "../db";
import {
	ReportStatusEnum,
	report,
	reportSetting,
	TransactionTypeEnum,
	transaction,
	user,
} from "../db/schema";

import {
	calculateSavingRate,
	convertToDollarUnit,
} from "../lib/format.currency";
import { calulateNextReportDate } from "../lib/helper";
import { sendReportEmail } from "../mailers/report.mailer";
import type { UpdateReportSettingType } from "../validators/report.validator";

// ── Get All Reports ─────────────────────────────────────────────────────────────

/**
 * Returns a paginated list of previously generated/scheduled reports
 * for the authenticated user.
 */
export const getAllReportsService = async (
	userId: string,
	pagination: { pageSize: number; pageNumber: number },
) => {
	const { pageSize, pageNumber } = pagination;
	const skip = (pageNumber - 1) * pageSize;

	const whereClause = eq(report.userId, userId);

	const [reports, countResult] = await Promise.all([
		db
			.select()
			.from(report)
			.where(whereClause)
			.orderBy(desc(report.createdAt))
			.limit(pageSize)
			.offset(skip),
		db.select({ totalCount: count() }).from(report).where(whereClause),
	]);

	const totalCount = countResult[0]?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	return {
		reports,
		pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
	};
};

// ── Generate Report ─────────────────────────────────────────────────────────────

/**
 * Generates an AI-powered financial report for the given date range,
 * emails it to the authenticated user, and persists a record in the
 * `report` table so it appears in the report history.
 *
 * @param userId   - ID of the authenticated user.
 * @param fromDate - Start of the reporting period.
 * @param toDate   - End of the reporting period.
 * @returns The generated report payload, or `null` when there is no activity.
 */
export const generateReportService = async (
	userId: string,
	fromDate: Date,
	toDate: Date,
) => {
	// ── 1. Fetch transactions ─────────────────────────────────────────────────
	const transactions = await db
		.select()
		.from(transaction)
		.where(
			and(
				eq(transaction.userId, userId),
				gte(transaction.date, fromDate),
				lte(transaction.date, toDate),
			),
		);

	if (!transactions.length) return null;

	// ── 2. Aggregate totals ───────────────────────────────────────────────────
	let totalIncome = 0;
	let totalExpenses = 0;
	const categoryMap: Record<string, number> = {};

	for (const tx of transactions) {
		const amount = Math.abs(tx.amount);
		if (tx.type === TransactionTypeEnum.INCOME) {
			totalIncome += amount;
		} else if (tx.type === TransactionTypeEnum.EXPENSE) {
			totalExpenses += amount;
			categoryMap[tx.category] = (categoryMap[tx.category] ?? 0) + amount;
		}
	}

	if (totalIncome === 0 && totalExpenses === 0) return null;

	// ── 3. Build top-spending categories ─────────────────────────────────────
	const topCategories = Object.entries(categoryMap)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5);

	const byCategory = topCategories.reduce(
		(acc, [category, total]) => {
			acc[category] = {
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

	// ── 4. Generate AI insights ───────────────────────────────────────────────
	const insights = await generateInsightsAI({
		totalIncome,
		totalExpenses,
		availableBalance,
		savingsRate,
		categories: byCategory,
		periodLabel,
	});

	// ── 5. Build the report payload ───────────────────────────────────────────
	const topCategoriesArray = Object.entries(byCategory).map(([name, cat]) => ({
		name,
		amount: cat.amount,
		percent: cat.percentage,
	}));

	const reportPayload = {
		period: periodLabel,
		summary: {
			income: convertToDollarUnit(totalIncome),
			expenses: convertToDollarUnit(totalExpenses),
			balance: convertToDollarUnit(availableBalance),
			savingsRate: Number(savingsRate.toFixed(1)),
			topCategories: topCategoriesArray,
		},
		insights,
	};

	// ── 6. Fetch the user's email & name for the notification ─────────────────
	const [userRecord] = await db
		.select({ email: user.email, name: user.name })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	// ── 7. Send the report email (non-blocking failure) ───────────────────────
	let emailSent = false;
	if (userRecord) {
		try {
			await sendReportEmail({
				email: userRecord.email,
				username: userRecord.name,
				report: {
					period: periodLabel,
					totalIncome: convertToDollarUnit(totalIncome),
					totalExpenses: convertToDollarUnit(totalExpenses),
					availableBalance: convertToDollarUnit(availableBalance),
					savingsRate: Number(savingsRate.toFixed(1)),
					topSpendingCategories: topCategoriesArray,
					insights,
				},
				frequency: "ONE_TIME",
			});
			emailSent = true;
		} catch (emailError) {
			// Log but do not fail the request — the report data is still returned
			console.error(
				`[generateReportService] Email delivery failed for user ${userId}:`,
				emailError,
			);
		}
	}

	// ── 8. Persist the report record in the database ──────────────────────────
	const reportStatus = emailSent
		? ReportStatusEnum.SENT
		: ReportStatusEnum.FAILED;

	await db.insert(report).values({
		id: crypto.randomUUID(),
		userId,
		period: periodLabel,
		sentDate: new Date(),
		status: reportStatus,
	});

	// ── 9. Return the payload to the caller ───────────────────────────────────
	return reportPayload;
};

// ── Update Report Setting ───────────────────────────────────────────────────────

/**
 * Creates or updates the report scheduling setting for the authenticated user.
 *
 * Behaviour:
 * - If no setting row exists, it is inserted (upsert on first call).
 * - When `isEnabled` is `true`, `nextReportDate` is recalculated using
 *   `dayOfMonth` so the cron fires on the correct day of the next month.
 * - When `isEnabled` is `false`, `nextReportDate` is set to `null`.
 *
 * @param userId - ID of the authenticated user.
 * @param body   - Validated request body fields.
 */
export const updateReportSettingService = async (
	userId: string,
	body: UpdateReportSettingType,
) => {
	const { isEnabled, dayOfMonth } = body;

	// Fetch the existing setting row (if any)
	const [existingReportSetting] = await db
		.select()
		.from(reportSetting)
		.where(eq(reportSetting.userId, userId))
		.limit(1);

	// Resolve the day of month to use (body → existing row → default 1)
	const resolvedDay = dayOfMonth ?? existingReportSetting?.dayOfMonth ?? 1;

	// Calculate nextReportDate only when enabling
	let nextReportDate: Date | null = null;
	if (isEnabled) {
		const currentNextReportDate = existingReportSetting?.nextReportDate;
		const now = new Date();

		if (!currentNextReportDate || currentNextReportDate <= now) {
			// Need to schedule fresh — use the last sent date as the base
			nextReportDate = calulateNextReportDate(
				existingReportSetting?.lastSentDate ?? undefined,
				resolvedDay,
			);
		} else {
			// Keep the already-scheduled date, but re-apply the new dayOfMonth
			nextReportDate = calulateNextReportDate(
				existingReportSetting?.lastSentDate ?? undefined,
				resolvedDay,
			);
		}
	}

	if (!existingReportSetting) {
		// No row yet — insert with the provided (or default) values
		await db.insert(reportSetting).values({
			id: crypto.randomUUID(),
			userId,
			...(isEnabled !== undefined && { isEnabled }),
			dayOfMonth: resolvedDay,
			nextReportDate,
		});
	} else {
		// Row exists — update only the supplied fields
		await db
			.update(reportSetting)
			.set({
				...(isEnabled !== undefined && { isEnabled }),
				dayOfMonth: resolvedDay,
				nextReportDate,
			})
			.where(eq(reportSetting.userId, userId));
	}
};

// -- Resend Report -----------------------------------------------------------------

export const resendReportService = async (
	userId: string,
	reportId: string,
) => {
	const { APIError } = await import('../lib/apiError');
	const { HTTPSTATUS } = await import('../configs/http.config');

	const [existingReport] = await db
		.select()
		.from(report)
		.where(and(eq(report.id, reportId), eq(report.userId, userId)))
		.limit(1);

	if (!existingReport) {
		throw new APIError(HTTPSTATUS.NOT_FOUND, 'Report not found');
	}

	const sentAt = new Date(existingReport.sentDate);
	const fromDate = new Date(sentAt.getFullYear(), sentAt.getMonth(), 1);
	const toDate = new Date(sentAt.getFullYear(), sentAt.getMonth() + 1, 0, 23, 59, 59);

	const reportPayload = await generateReportService(userId, fromDate, toDate);

	if (!reportPayload) {
		return { resent: false, message: 'No transaction data for this period' };
	}

	await db
		.update(report)
		.set({ status: ReportStatusEnum.SENT, sentDate: new Date() })
		.where(eq(report.id, reportId));

	return { resent: true };
};
