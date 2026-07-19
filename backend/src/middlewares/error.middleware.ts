import type { NextFunction, Request, Response } from "express";
import { APIError } from "../lib/apiError.js";

function getErrorStatusCode(err: unknown): number {
	if (
		typeof err === "object" &&
		err !== null &&
		"statusCode" in err &&
		typeof err.statusCode === "number"
	) {
		return err.statusCode;
	}

	if (err instanceof Error && err.name === "ValidationError") {
		return 400;
	}

	return 500;
}

function getErrorMessage(err: unknown): string {
	if (err instanceof Error && err.message) {
		return err.message;
	}

	return "Internal Server Error";
}

export const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const error =
		err instanceof APIError
			? err
			: new APIError(
					getErrorStatusCode(err),
					getErrorMessage(err),
					[],
					err instanceof Error ? err.stack : "",
				);

	const response = {
		success: false,
		message: error.message,
		errors: error.errors,
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
	};

	const path = req.originalUrl || req.url;
	console.error(`[API ERROR] ${req.method} ${path} -> ${error.statusCode}`);
	console.error(`[API ERROR MESSAGE] ${error.message}`);
	if (process.env.NODE_ENV === "development" && error.stack) {
		console.error(`[API ERROR STACK]\n${error.stack}`);
	}

	return res.status(error.statusCode).json(response);
};
