import { Router } from "express";
import { upload } from "../configs/cloudinary.config.js";

import {
	bulkDeleteTransactionController,
	bulkTransactionController,
	createTransactionController,
	deleteTransactionController,
	duplicateTransactionController,
	getAllTransactionController,
	getTransactionByIdController,
	scanReceiptController,
	updateTransactionController,
} from "../controllers/transaction.controller.js";

const transactionRoutes = Router();

transactionRoutes.get("/all", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.put("/update/:id", updateTransactionController);
transactionRoutes.delete("/delete/:id", deleteTransactionController);
transactionRoutes.put("/duplicate/:id", duplicateTransactionController);

transactionRoutes.post(
	"/scan-receipt",
	upload.single("receipt"),
	scanReceiptController,
);

transactionRoutes.post("/bulk-transaction", bulkTransactionController);
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController);

export default transactionRoutes;
