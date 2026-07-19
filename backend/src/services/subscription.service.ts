import { count, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { subscription } from "../db/schema/subscription.schema.js";
import { transaction } from "../db/schema/transaction.schema.js";

export const FREE_PLAN_LIMITS = {
	MAX_TRANSACTIONS: 30,
	ANALYTICS_DAYS: 7,
	BULK_IMPORT: false,
} as const;

// ── Internal helper ──────────────────────────────────────────────────────────

/**
 * Fetch the most relevant active subscription row for a user.
 *
 * `referenceId` is the userId stored by the Better Auth Stripe plugin.
 * A subscription is considered active when:
 *   - status is "active" or "trialing"
 *   - AND periodEnd is null (no end set) OR still in the future
 * If `cancelAtPeriodEnd` is true, access is still valid until the period end.
 */
async function getActiveSubscription(userId: string) {
	const now = new Date();

	const rows = await db
		.select()
		.from(subscription)
		.where(eq(subscription.referenceId, userId));

	return (
		rows.find((r) => {
			const isActiveStatus = r.status === "active" || r.status === "trialing";
			const isNotExpired = !r.periodEnd || r.periodEnd > now;
			return isActiveStatus && isNotExpired;
		}) ?? null
	);
}

// ── Public service functions ─────────────────────────────────────────────────

/**
 * Check if a user is on an active paid plan.
 * Source of truth is the `subscription` table managed by the Better Auth Stripe plugin.
 * The plan name configured in auth.ts is "pro".
 */
export async function isUserSubscribedService(
	userId: string,
): Promise<boolean> {
	const activeSub = await getActiveSubscription(userId);
	return activeSub !== null && activeSub.plan === "pro";
}

/**
 * Count total transactions for a user.
 */
export async function getUserTransactionCountService(
	userId: string,
): Promise<number> {
	const [result] = await db
		.select({ total: count() })
		.from(transaction)
		.where(eq(transaction.userId, userId));
	return result?.total ?? 0;
}

/**
 * Get full subscription status for the frontend Billing tab.
 * Reads from the subscription table — no direct Stripe API call at runtime.
 */
export async function getSubscriptionStatusService(userId: string) {
	const activeSub = await getActiveSubscription(userId);
	const isPro = activeSub !== null && activeSub.plan === "pro";

	return {
		isSubscribed: isPro,
		plan: isPro ? "pro" : "free",
		// Subscription metadata exposed to the billing UI
		subscription: isPro
			? {
					status: activeSub!.status,
					stripeSubscriptionId: activeSub!.stripeSubscriptionId,
					periodStart: activeSub!.periodStart,
					periodEnd: activeSub!.periodEnd,
					cancelAtPeriodEnd: activeSub!.cancelAtPeriodEnd,
					cancelAt: activeSub!.cancelAt,
					billingInterval: activeSub!.billingInterval,
				}
			: null,
		limits: isPro
			? {
					maxTransactions: null, // unlimited
					analyticsPresets: ["1W", "1M", "3M", "6M", "1Y", "ALL"],
					bulkImport: true,
				}
			: {
					maxTransactions: FREE_PLAN_LIMITS.MAX_TRANSACTIONS,
					analyticsPresets: ["1W"],
					bulkImport: false,
				},
	};
}
