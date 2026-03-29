import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { isUserSubscribedService } from "../services/subscription.service";
import {
    chartAnalyticsService,
    expensePieChartBreakdownService,
    summaryAnalyticsService,
} from "../services/analytics.service";

const FREE_ALLOWED_PRESETS = ["1W"] as const;

/** For free users, force preset to "1W" and clear any custom range. */
async function enforcePlanPreset(
    userId: string,
    preset: string | undefined,
): Promise<{ preset: string; customFrom?: Date; customTo?: Date }> {
    const isSubscribed = await isUserSubscribedService(userId);
    if (!isSubscribed) {
        // Free plan → always use 7-day window
        return { preset: "1W" };
    }
    return { preset: preset ?? "ALL" };
}

// ── Summary Controller ─────────────────────────────────────────────────────────

export const summaryAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset: rawPreset, from, to } = req.query;
        const { preset, customFrom, customTo } = await enforcePlanPreset(
            userId,
            rawPreset as string | undefined,
        );
        const resolvedFrom = customFrom ?? (from ? new Date(from as string) : undefined);
        const resolvedTo = customTo ?? (to ? new Date(to as string) : undefined);

        const data = await summaryAnalyticsService(
            userId,
            preset,
            resolvedFrom,
            resolvedTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Summary fetched successfully", data });
    },
);

// ── Chart Controller ───────────────────────────────────────────────────────────

export const chartAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset: rawPreset, from, to } = req.query;
        const { preset, customFrom, customTo } = await enforcePlanPreset(
            userId,
            rawPreset as string | undefined,
        );
        const resolvedFrom = customFrom ?? (from ? new Date(from as string) : undefined);
        const resolvedTo = customTo ?? (to ? new Date(to as string) : undefined);

        const data = await chartAnalyticsService(
            userId,
            preset,
            resolvedFrom,
            resolvedTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Chart data fetched successfully", data });
    },
);

// ── Expense Breakdown Controller ───────────────────────────────────────────────

export const expensePieChartBreakdownController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset: rawPreset, from, to } = req.query;
        const { preset, customFrom, customTo } = await enforcePlanPreset(
            userId,
            rawPreset as string | undefined,
        );
        const resolvedFrom = customFrom ?? (from ? new Date(from as string) : undefined);
        const resolvedTo = customTo ?? (to ? new Date(to as string) : undefined);

        const data = await expensePieChartBreakdownService(
            userId,
            preset,
            resolvedFrom,
            resolvedTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Expense breakdown fetched successfully", data });
    },
);
