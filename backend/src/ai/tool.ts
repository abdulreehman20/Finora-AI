import { tool } from "langchain";
import { z } from "zod";
import {
  chartAnalyticsService,
  expensePieChartBreakdownService,
  summaryAnalyticsService,
} from "../services/analytics.service.js";
import { generateReportService } from "../services/report.service.js";
import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  updateTransactionService,
} from "../services/transaction.service.js";
import {
  bulkDeleteTransactionSchema,
  bulkTransactionItemSchema,
  createTransactionSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator.js";

const dbOperationSchema = z.object({
  operation: z.enum([
    "get_single_transaction",
    "get_all_transactions",
    "add_transaction",
    "update_transaction",
    "delete_transaction",
    "bulk_add_transactions",
    "bulk_delete_transactions",
  ]),
  transactionId: z.string().uuid().optional(),
  filters: z
    .object({
      keyword: z.string().optional(),
      type: z.enum(["INCOME", "EXPENSE"]).optional(),
      recurringStatus: z.enum(["RECURRING", "NON_RECURRING"]).optional(),
    })
    .optional(),
  pagination: z
    .object({
      pageSize: z.number().int().min(1).max(100).default(20),
      pageNumber: z.number().int().min(1).default(1),
    })
    .optional(),
  // Use z.any() here to avoid emitting JSON Schema `propertyNames`,
  // which Gemini function-calling rejects.
  transaction: z.any().optional(),
  transactions: z.array(z.any()).optional(),
  transactionIds: z.array(z.string().uuid()).optional(),
});

const analyticsToolSchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]),
});

const emailReportSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
});

function resolvePreset(period: "weekly" | "monthly" | "yearly") {
  switch (period) {
    case "weekly":
      return "1W";
    case "monthly":
      return "1M";
    case "yearly":
      return "1Y";
    default:
      return "1M";
  }
}

function monthWindow(month?: number, year?: number) {
  const now = new Date();
  const resolvedMonth = month ?? now.getMonth() + 1;
  const resolvedYear = year ?? now.getFullYear();

  const from = new Date(resolvedYear, resolvedMonth - 1, 1);
  const to = new Date(resolvedYear, resolvedMonth, 0, 23, 59, 59, 999);
  return { from, to, resolvedMonth, resolvedYear };
}

export function buildAgentTools(userId: string) {
  const chatWithDatabaseTool = tool(
    async (input) => {
      switch (input.operation) {
        case "get_single_transaction": {
          if (!input.transactionId) {
            return JSON.stringify({
              success: false,
              message: "transactionId is required",
            });
          }
          const data = await getTransactionByIdService(
            userId,
            input.transactionId,
          );
          return JSON.stringify({ success: true, data });
        }
        case "get_all_transactions": {
          const filters = {
            ...(input.filters?.keyword
              ? { keyword: input.filters.keyword }
              : {}),
            ...(input.filters?.type ? { type: input.filters.type } : {}),
            ...(input.filters?.recurringStatus
              ? { recurringStatus: input.filters.recurringStatus }
              : {}),
          };
          const pagination = input.pagination ?? {
            pageSize: 20,
            pageNumber: 1,
          };
          const data = await getAllTransactionService(
            userId,
            filters,
            pagination,
          );
          return JSON.stringify({ success: true, data });
        }
        case "add_transaction": {
          const parsed = createTransactionSchema.parse(input.transaction ?? {});
          const data = await createTransactionService(parsed, userId);
          return JSON.stringify({ success: true, data });
        }
        case "update_transaction": {
          if (!input.transactionId) {
            return JSON.stringify({
              success: false,
              message: "transactionId is required",
            });
          }
          const parsed = updateTransactionSchema.parse(input.transaction ?? {});
          await updateTransactionService(userId, input.transactionId, parsed);
          return JSON.stringify({
            success: true,
            message: "Transaction updated",
          });
        }
        case "delete_transaction": {
          if (!input.transactionId) {
            return JSON.stringify({
              success: false,
              message: "transactionId is required",
            });
          }
          await deleteTransactionService(userId, input.transactionId);
          return JSON.stringify({
            success: true,
            message: "Transaction deleted",
          });
        }
        case "bulk_add_transactions": {
          const txList = z
            .array(bulkTransactionItemSchema)
            .parse(input.transactions ?? []);
          const data = await bulkTransactionService(userId, txList);
          return JSON.stringify({ success: true, data });
        }
        case "bulk_delete_transactions": {
          const parsed = bulkDeleteTransactionSchema.parse({
            transactionIds: input.transactionIds ?? [],
          });
          const data = await bulkDeleteTransactionService(
            userId,
            parsed.transactionIds,
          );
          return JSON.stringify({ success: true, data });
        }
      }
    },
    {
      name: "chat_with_database",
      description:
        "Manage authenticated user transactions (read/create/update/delete and bulk operations). Use this only when the request needs transaction records or transaction mutations.",
      schema: dbOperationSchema,
    },
  );

  const analyticsTool = tool(
    async (input) => {
      const preset = resolvePreset(input.period);
      const [summary, chart, expenseBreakdown] = await Promise.all([
        summaryAnalyticsService(userId, preset),
        chartAnalyticsService(userId, preset),
        expensePieChartBreakdownService(userId, preset),
      ]);

      return JSON.stringify({
        success: true,
        period: input.period,
        payload: {
          summary,
          chart,
          expenseBreakdown,
        },
      });
    },
    {
      name: "analytics_tool",
      description:
        "Generate structured weekly, monthly, or yearly personal-finance analytics from user transaction data for charting and financial insights.",
      schema: analyticsToolSchema,
    },
  );

  const emailReportTool = tool(
    async (input) => {
      const { from, to, resolvedMonth, resolvedYear } = monthWindow(
        input.month,
        input.year,
      );
      const report = await generateReportService(userId, from, to);

      if (!report) {
        return JSON.stringify({
          success: false,
          message:
            "No transactions found for the selected month. Report was not generated.",
          month: resolvedMonth,
          year: resolvedYear,
        });
      }

      return JSON.stringify({
        success: true,
        message: "Monthly email report compiled and sent successfully.",
        month: resolvedMonth,
        year: resolvedYear,
        report,
      });
    },
    {
      name: "email_report_tool",
      description:
        "Compile and send a monthly income/expense report to the authenticated user email for budgeting and financial planning follow-up.",
      schema: emailReportSchema,
    },
  );

  return [chatWithDatabaseTool, analyticsTool, emailReportTool];
}
