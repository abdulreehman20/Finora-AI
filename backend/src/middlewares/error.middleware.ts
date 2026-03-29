import type { NextFunction, Request, Response } from "express";
import { APIError } from "../lib/apiError";

export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	let error = err;

	if (!(error instanceof APIError)) {
		const statusCode =
			error.statusCode || (error.name === "ValidationError" ? 400 : 500);
		const message = error.message || "Internal Server Error";
		error = new APIError(statusCode, message, [], err.stack);
	}

	const response = {
		success: false,
		message: error.message,
		errors: error.errors,
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
	};

	return res.status(error.statusCode).json(response);
};
