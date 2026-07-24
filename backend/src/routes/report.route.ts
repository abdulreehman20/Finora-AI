import { Router } from "express";
import {
	generateReportController,
	getAllReportsController,
	getReportSettingController,
	resendReportController,
	updateReportSettingController,
} from "../controllers/report.controller.js";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/setting", getReportSettingController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.post("/resend/:reportId", resendReportController);

export default reportRoutes;
