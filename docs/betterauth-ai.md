 Your approach is **valid but has trade-offs**. The Stripe plugin already stores subscription status in the `subscription` table, so adding a `plan` field to the user table creates **data duplication**. Here's my recommendation:

## ✅ Recommended Approach: Keep it in Subscription Table

Instead of duplicating the plan on the user, **query the subscription table** when you need to check if a user is on a free or paid plan:

```typescript
// Helper function to check user's plan status
export async function getUserPlanStatus(userId: string) {
  const subscription = await db.query.subscription.findFirst({
    where: (sub, { and, eq, or }) => and(
      eq(sub.referenceId, userId),
      or(
        eq(sub.status, "active"),
        eq(sub.status, "trialing")
      )
    ),
    orderBy: (sub, { desc }) => desc(sub.createdAt),
  });

  return {
    plan: subscription?.plan ?? "free", // "free" or "premium"
    status: subscription?.status ?? "inactive",
    isPaid: !!subscription && ["active", "trialing"].includes(subscription.status),
  };
}
```

### Why this is better:
- **Single source of truth** - No data sync issues
- The Stripe plugin handles all subscription lifecycle events automatically
- User can have multiple subscriptions over time (history preserved)
