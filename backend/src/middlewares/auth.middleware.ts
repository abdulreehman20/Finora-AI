import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

import { auth } from "../lib/auth.js";

/**
 * Attach Better Auth user to req.user from session cookies/headers.
 * Required for all protected /api/* routes that read req.user?.id.
 */
export const attachUserFromSession = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});

		if (session?.user) {
			req.user = {
				...session.user,
				image: session.user.image ?? null,
				username: session.user.username ?? null,
				displayUsername: session.user.displayUsername ?? null,
				stripeCustomerId: session.user.stripeCustomerId ?? null,
			};
		}
	} catch {
		// Leave req.user undefined when session lookup fails
	}

	next();
};
