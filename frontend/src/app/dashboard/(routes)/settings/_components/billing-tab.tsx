"use client";

import {
  IconCheck,
  IconCrown,
  IconExternalLink,
  IconLoader2,
  IconRefresh,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  getSubscriptionStatusAction,
  type SubscriptionStatus,
} from "@/actions/subscription/actions";

const FREE_FEATURES = [
  "Up to 30 transactions total",
  "Monthly email reports",
  "Last 7-day analytics only",
  "Basic AI chat",
];

const PRO_FEATURES = [
  "Unlimited transactions",
  "Bulk CSV import",
  "Full analytics (all time ranges)",
  "Advanced AI chat",
  "Priority support",
  "Monthly financial reports",
];

export function BillingTab() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  async function fetchStatus() {
    setLoading(true);
    try {
      const data = await getSubscriptionStatusAction();
      setStatus(data);
    } catch {
      // silently fall back
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const { error } = await authClient.subscription.upgrade({
        plan: "pro", // ← Must match backend plan name exactly (case-sensitive)
        successUrl: `${window.location.origin}/dashboard/settings?tab=billing&success=1`,
        cancelUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
      });
      if (error) {
        toast.error(error.message ?? "Failed to start checkout");
        setCheckoutLoading(false);
      }
      // Stripe will redirect on success — execution won't reach here
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start checkout",
      );
      setCheckoutLoading(false);
    }
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const { data: subs, error } = await authClient.subscription.list();
      if (error) {
        toast.error(error.message ?? "Failed to fetch subscriptions");
        return;
      }
      const activeSub = subs?.find(
        (s) => s.status === "active" || s.status === "trialing",
      );
      if (!activeSub) {
        toast.error("No active subscription found");
        return;
      }
      const { error: cancelError } = await authClient.subscription.cancel({
        subscriptionId: activeSub.id,
        returnUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
      });
      if (cancelError) {
        toast.error(cancelError.message ?? "Failed to cancel subscription");
        return;
      }
      toast.success("Subscription cancelled. You'll retain access until the period ends.");
      await fetchStatus();
    } catch (err) {
      toast.error("Could not cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }
  const isPro = status?.isSubscribed ?? false;


  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Billing</h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            Manage your subscription and payment details.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStatus}
          disabled={loading}
          title="Refresh status"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
        >
          <IconRefresh size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
          <IconLoader2 size={20} className="animate-spin text-green-500" />
          <span className="text-sm">Loading billing info...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Plan Banner */}
          <div
            className={`rounded-2xl border p-6 ${isPro
                ? "border-green-500/30 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent"
                : "border-white/10 bg-[oklch(0.10_0.01_145)]"
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isPro ? (
                    <IconCrown size={18} className="text-yellow-400" />
                  ) : (
                    <IconSparkles size={18} className="text-zinc-500" />
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </h3>
                </div>
                {isPro ? (
                  <p className="text-sm text-zinc-400">
                    You have full access to all Finora features.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Upgrade to Pro to unlock unlimited transactions, bulk
                    import, and full analytics.
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${isPro
                    ? "bg-green-500/15 border-green-500/20 text-green-400"
                    : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                  }`}
              >
                {isPro ? "Active" : "Free"}
              </span>
            </div>

            {/* Cancel subscription (Pro users) */}
            {isPro && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelLoading}
                className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:border-red-500/30 transition-all disabled:opacity-40"
              >
                {cancelLoading ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <IconX size={14} />
                )}
                Cancel Subscription
              </button>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Free Card */}
            <div
              className={`rounded-2xl border p-5 ${!isPro
                  ? "border-white/20 bg-white/5"
                  : "border-white/10 bg-[oklch(0.10_0.01_145)] opacity-60"
                }`}
            >
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Free
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  $0
                  <span className="text-base font-normal text-zinc-500">
                    /mo
                  </span>
                </p>
              </div>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <IconCheck
                      size={14}
                      className="mt-0.5 shrink-0 text-zinc-500"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Card */}
            <div
              className={`rounded-2xl border p-5 relative overflow-hidden ${isPro
                  ? "border-green-500/40 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent"
                  : "border-white/10 bg-[oklch(0.10_0.01_145)]"
                }`}
            >
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                  Popular
                </span>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  Pro
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  $10
                  <span className="text-base font-normal text-zinc-500">
                    /mo
                  </span>
                </p>
              </div>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <IconCheck
                      size={14}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrade CTA (free users only) */}
          {!isPro && (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
            >
              {checkoutLoading ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconCrown size={16} />
              )}
              {checkoutLoading
                ? "Redirecting to Stripe..."
                : "Upgrade to Pro — $10/mo"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
