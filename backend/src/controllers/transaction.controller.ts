import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import type { TransactionTypeEnum } from "../db/schema/transaction.schema";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
	FREE_PLAN_LIMITS,
	getUserTransactionCountService,
	isUserSubscribedService,
} from "../services/subscription.service";
import {
	bulkDeleteTransactionService,
	bulkTransactionService,
	createTransactionService,
	deleteTransactionService,
	duplicateTransactionService,
	getAllTransactionService,
	getTransactionByIdService,
	scanReceiptService,
	updateTransactionService,
} from "../services/transaction.service";
import {
	bulkDeleteTransactionSchema,
	bulkTransactionSchema,
	createTransactionSchema,
	transactionIdSchema,
	updateTransactionSchema,
} from "../validators/transaction.validator";

// Get All Transaction Controller
export const getAllTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const filters = {
			...(req.query.keyword && { keyword: req.query.keyword as string }),
			...(req.query.type && {
				type: req.query.type as keyof typeof TransactionTypeEnum,
			}),
			...(req.query.recurringStatus && {
				recurringStatus: req.query.recurringStatus as
					| "RECURRING"
					| "NON_RECURRING",
			}),
		};

		const pagination = {
			pageSize: parseInt(req.query.pageSize as string, 10) || 20,
			pageNumber: parseInt(req.query.pageNumber as string, 10) || 1,
		};

		const result = await getAllTransactionService(userId, filters, pagination);

		return res.status(HTTPSTATUS.OK).json({
			message: "Transaction fetched successfully",
			...result,
		});
	},
);

// Get Transaction By Id Controller
export const getTransactionByIdController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const transactionId = transactionIdSchema.parse(req.params.id);

		const transaction = await getTransactionByIdService(userId, transactionId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Transaction fetched successfully",
			transaction,
		});
	},
);

// Create Transaction Controller
export const createTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const body = createTransactionSchema.parse(req.body);
		const userId = req.user?.id;

		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		// ── Plan restriction: free users capped at 30 transactions ──
		const isSubscribed = await isUserSubscribedService(userId);
		if (!isSubscribed) {
			const txCount = await getUserTransactionCountService(userId);
			if (txCount >= FREE_PLAN_LIMITS.MAX_TRANSACTIONS) {
				return res.status(HTTPSTATUS.FORBIDDEN).json({
					message: `Free plan allows a maximum of ${FREE_PLAN_LIMITS.MAX_TRANSACTIONS} transactions. Please upgrade to Pro for unlimited transactions.`,
					code: "TRANSACTION_LIMIT_REACHED",
				});
			}
		}

		const transaction = await createTransactionService(body, userId);

		return res
			.status(HTTPSTATUS.CREATED)
			.json({ message: "Transacton created successfully", transaction });
	},
);


// Update Transaction Controller
export const updateTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const transactionId = transactionIdSchema.parse(req.params.id);
		const body = updateTransactionSchema.parse(req.body);

		await updateTransactionService(userId, transactionId, body);

		return res
			.status(HTTPSTATUS.OK)
			.json({ message: "Transaction updated successfully" });
	},
);

// Duplicate Transaction Controller
export const duplicateTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const transactionId = transactionIdSchema.parse(req.params.id);

		const transaction = await duplicateTransactionService(
			userId,
			transactionId,
		);

		return res.status(HTTPSTATUS.OK).json({
			message: "Transaction duplicated successfully",
			data: transaction,
		});
	},
);

// Delete Transaction Controller
export const deleteTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const transactionId = transactionIdSchema.parse(req.params.id);

		await deleteTransactionService(userId, transactionId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Transaction deleted successfully",
		});
	},
);

// Scan Recipt Controller
export const scanReceiptController = asyncHandler(
	async (req: Request, res: Response) => {
		const file = req?.file;

		const result = await scanReceiptService(file);

		return res
			.status(HTTPSTATUS.OK)
			.json({ message: "Reciept scanned successfully", data: result });
	},
);

// Bulk Transaction Controller
export const bulkTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		// ── Plan restriction: bulk import is Pro-only ──
		const isSubscribed = await isUserSubscribedService(userId);
		if (!isSubscribed) {
			return res.status(HTTPSTATUS.FORBIDDEN).json({
				message: "Bulk import is only available on the Pro plan. Please upgrade to access this feature.",
				code: "BULK_IMPORT_RESTRICTED",
			});
		}

		const { transactions } = bulkTransactionSchema.parse(req.body);

		const result = await bulkTransactionService(userId, transactions);

		return res.status(HTTPSTATUS.OK).json({
			message: "Bulk transaction inserted successfully",
			...result,
		});
	},
);

//  Bulk Delete Transaction Controller
export const bulkDeleteTransactionController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		const { transactionIds } = bulkDeleteTransactionSchema.parse(req.body);

		const result = await bulkDeleteTransactionService(userId, transactionIds);

		return res.status(HTTPSTATUS.OK).json({
			message: "Transaction deleted successfully",
			...result,
		});
	},
);
