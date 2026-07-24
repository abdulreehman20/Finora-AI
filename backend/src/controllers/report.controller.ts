import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import {
	generateReportService,
	getAllReportsService,
	getReportSettingService,
	resendReportService,
	updateReportSettingService,
} from "../services/report.service.js";
import { updateReportSettingSchema } from "../validators/report.validator.js";

/** GET /report/all — paginated report history for the authenticated user. */
export const getAllReportsController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const pagination = {
			pageSize: parseInt(req.query.pageSize as string, 10) || 20,
			pageNumber: parseInt(req.query.pageNumber as string, 10) || 1,
		};

		const result = await getAllReportsService(userId, pagination);

		return res.status(HTTPSTATUS.OK).json({
			message: "Reports history fetched successfully",
			...result,
		});
	},
);

/** GET /report/setting — current scheduling preferences. */
export const getReportSettingController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const setting = await getReportSettingService(userId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Report setting fetched successfully",
			setting,
		});
	},
);

/** GET /report/generate — manual one-off generation for a date range. */
export const generateReportController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const { from, to } = req.query;
		const fromDate = new Date(from as string);
		const toDate = new Date(to as string);

		const result = await generateReportService(userId, fromDate, toDate);

		return res.status(HTTPSTATUS.OK).json({
			message: "Report generated successfully",
			...result,
		});
	},
);

/** PUT /report/update-setting — toggle, frequency, email override. */
export const updateReportSettingController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const body = updateReportSettingSchema.parse(req.body);
		const setting = await updateReportSettingService(userId, body);

		return res.status(HTTPSTATUS.OK).json({
			message: "Reports setting updated successfully",
			setting,
		});
	},
);

/** POST /report/resend/:reportId — resend stored email content. */
export const resendReportController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });
		}

		const reportId = req.params.reportId as string;
		const result = await resendReportService(userId, reportId);

		return res.status(HTTPSTATUS.OK).json({
			message: "Report resent successfully",
			...result,
		});
	},
);
