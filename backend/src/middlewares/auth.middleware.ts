import type { NextFunction, Request, Response } from "express";
import type { User } from "../@types/express";
import { auth } from "../lib/auth";

/**
 * Attach Better Auth user to req.user based on the incoming cookies/headers.
 * This lets non-auth routes (like /api/transaction/*) know which user is logged in.
 */
export const attachUserFromSession = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const result = await auth.api.getSession({
			headers: req.headers as Record<string, string>,
		});

		const user =
			(result as any)?.user ?? (result as any)?.session?.user ?? null;

		if (user) {
			req.user = user as User;
		}
	} catch {
		// If session lookup fails, leave req.user undefined and continue
	}

	next();
};
