import type { NextFunction, Request, Response } from "express";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const startedAt = Date.now();
	const timestamp = new Date().toISOString();
	const path = req.originalUrl || req.url;

	console.log(`[API HIT] ${timestamp} ${req.method} ${path}`);

	res.on("finish", () => {
		const durationMs = Date.now() - startedAt;
		if (res.statusCode >= 400) {
			console.error(
				`[API ERROR RESPONSE] ${req.method} ${path} -> ${res.statusCode} (${durationMs}ms)`,
			);
			return;
		}

		console.log(
			`[API SUCCESS] ${req.method} ${path} -> ${res.statusCode} (${durationMs}ms)`,
		);
	});

	next();
};
