import type { InferSelectModel } from "drizzle-orm";
import type { user } from "../db/schema/user.schema";

export type User = InferSelectModel<typeof user>;

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}
