import { db } from "../db";
import { differenceInDays, subDays, subYears } from "date-fns";
import { and, eq, gte, lte, sql, sum, count } from "drizzle-orm";
import {TransactionTypeEnum, transaction } from "../db/schema/transaction.schema";
import { calculateSavingRate, convertToDollarUnit } from "../lib/format.currency";

// ── Date Range Helpers ─────────────────────────────────────────────────────────

function getDateRange(
  preset?: string,
  customFrom?: Date,
  customTo?: Date,
): { from: Date | undefined; to: Date | undefined; label: string } {
  const now = new Date();

  if (customFrom && customTo) {
    return {
      from: customFrom,
      to: customTo,
      label: `${customFrom.toDateString()} – ${customTo.toDateString()}`,
    };
  }

  switch (preset) {
    case "1W":
      return { from: subDays(now, 7), to: now, label: "Last 7 Days" };
    case "1M":
      return { from: subDays(now, 30), to: now, label: "Last 30 Days" };
    case "3M":
      return { from: subDays(now, 90), to: now, label: "Last 3 Months" };
    case "6M":
      return { from: subDays(now, 180), to: now, label: "Last 6 Months" };
    case "1Y":
      return { from: subYears(now, 1), to: now, label: "Last Year" };
    default:
      return { from: undefined, to: undefined, label: "All Time" };
  }
}

function calcPercentageChange(previous: number, current: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return parseFloat(Math.min(Math.max(change, -100), 100).toFixed(2));
}

// ── Summary Analytics ─────────────────────────────────────────────────────────

export const summaryAnalyticsService = async (
  userId: string,
  preset?: string,
  customFrom?: Date,
  customTo?: Date,
) => {
  const { from, to, label } = getDateRange(preset, customFrom, customTo);

  const dateConds =
    from && to ? [gte(transaction.date, from), lte(transaction.date, to)] : [];

  const [result] = await db
    .select({
      totalIncome: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.INCOME} THEN ABS(${transaction.amount}) ELSE 0 END`,
      ).mapWith(Number),
      totalExpenses: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.EXPENSE} THEN ABS(${transaction.amount}) ELSE 0 END`,
      ).mapWith(Number),
      transactionCount: count(),
    })
    .from(transaction)
    .where(and(eq(transaction.userId, userId), ...dateConds));

  const income = result?.totalIncome ?? 0;
  const expenses = result?.totalExpenses ?? 0;
  const balance = income - expenses;
  const savingsPercentage =
    income > 0
      ? parseFloat((((income - expenses) / income) * 100).toFixed(2))
      : 0;
  const expenseRatio =
    income > 0 ? parseFloat(((expenses / income) * 100).toFixed(2)) : 0;

  // Previous period comparison
  let percentageChange = {
    income: 0,
    expenses: 0,
    balance: 0,
    previousValues: {
      incomeAmount: 0,
      expenseAmount: 0,
      balanceAmount: 0,
    },
  };

  if (from && to && preset && preset !== "ALL") {
    const periodDays = differenceInDays(to, from) + 1;
    const isYearly = preset === "1Y";
    const prevFrom = isYearly ? subYears(from, 1) : subDays(from, periodDays);
    const prevTo = isYearly ? subYears(to, 1) : subDays(to, periodDays);

    const [prevResult] = await db
      .select({
        totalIncome: sum(
          sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.INCOME} THEN ABS(${transaction.amount}) ELSE 0 END`,
        ).mapWith(Number),
        totalExpenses: sum(
          sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.EXPENSE} THEN ABS(${transaction.amount}) ELSE 0 END`,
        ).mapWith(Number),
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, prevFrom),
          lte(transaction.date, prevTo),
        ),
      );

    const prevIncome = prevResult?.totalIncome ?? 0;
    const prevExpenses = prevResult?.totalExpenses ?? 0;
    const prevBalance = prevIncome - prevExpenses;

    percentageChange = {
      income: calcPercentageChange(prevIncome, income),
      expenses: calcPercentageChange(prevExpenses, expenses),
      balance: calcPercentageChange(prevBalance, balance),
      previousValues: {
        incomeAmount: convertToDollarUnit(prevIncome),
        expenseAmount: convertToDollarUnit(prevExpenses),
        balanceAmount: convertToDollarUnit(prevBalance),
      },
    };
  }

  return {
    availableBalance: convertToDollarUnit(balance),
    totalIncome: convertToDollarUnit(income),
    totalExpenses: convertToDollarUnit(expenses),
    savingRate: {
      percentage: savingsPercentage,
      expenseRatio,
      savingsRate: calculateSavingRate(income, expenses),
    },
    transactionCount: result?.transactionCount ?? 0,
    percentageChange,
    preset: { label, value: preset ?? "ALL" },
  };
};

// ── Chart Analytics ───────────────────────────────────────────────────────────

export const chartAnalyticsService = async (
  userId: string,
  preset?: string,
  customFrom?: Date,
  customTo?: Date,
) => {
  const { from, to, label } = getDateRange(preset, customFrom, customTo);
  const dateConds =
    from && to ? [gte(transaction.date, from), lte(transaction.date, to)] : [];

  const rows = await db
    .select({
      dateKey: sql<string>`TO_CHAR(${transaction.date}, 'YYYY-MM-DD')`,
      income: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.INCOME} THEN ABS(${transaction.amount}) ELSE 0 END`,
      ).mapWith(Number),
      expenses: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.EXPENSE} THEN ABS(${transaction.amount}) ELSE 0 END`,
      ).mapWith(Number),
      incomeCount: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.INCOME} THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      expenseCount: sum(
        sql`CASE WHEN ${transaction.type} = ${TransactionTypeEnum.EXPENSE} THEN 1 ELSE 0 END`,
      ).mapWith(Number),
    })
    .from(transaction)
    .where(and(eq(transaction.userId, userId), ...dateConds))
    .groupBy(sql`TO_CHAR(${transaction.date}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${transaction.date}, 'YYYY-MM-DD') ASC`);

  let totalIncomeCount = 0;
  let totalExpenseCount = 0;

  const chartData = rows.map((row) => {
    totalIncomeCount += row.incomeCount ?? 0;
    totalExpenseCount += row.expenseCount ?? 0;
    return {
      date: row.dateKey,
      income: convertToDollarUnit(row.income ?? 0),
      expenses: convertToDollarUnit(row.expenses ?? 0),
    };
  });

  return {
    chartData,
    totalIncomeCount,
    totalExpenseCount,
    preset: { label, value: preset ?? "ALL" },
  };
};

// ── Expense Pie-Chart Breakdown ───────────────────────────────────────────────

export const expensePieChartBreakdownService = async (
  userId: string,
  preset?: string,
  customFrom?: Date,
  customTo?: Date,
) => {
  const { from, to, label } = getDateRange(preset, customFrom, customTo);
  const dateConds =
    from && to ? [gte(transaction.date, from), lte(transaction.date, to)] : [];

  const rows = await db
    .select({
      category: transaction.category,
      value: sum(sql`ABS(${transaction.amount})`).mapWith(Number),
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.type, TransactionTypeEnum.EXPENSE),
        ...dateConds,
      ),
    )
    .groupBy(transaction.category)
    .orderBy(sql`SUM(ABS(${transaction.amount})) DESC`);

  const totalSpent = rows.reduce((acc, r) => acc + (r.value ?? 0), 0);

  const topThree = rows.slice(0, 3);
  const othersTotal = rows.slice(3).reduce((acc, r) => acc + (r.value ?? 0), 0);

  const breakdown = [
    ...topThree.map((r) => ({
      name: r.category,
      value: convertToDollarUnit(r.value ?? 0),
      percentage:
        totalSpent > 0 ? Math.round(((r.value ?? 0) / totalSpent) * 100) : 0,
    })),
    ...(othersTotal > 0
      ? [
          {
            name: "Others",
            value: convertToDollarUnit(othersTotal),
            percentage:
              totalSpent > 0 ? Math.round((othersTotal / totalSpent) * 100) : 0,
          },
        ]
      : []),
  ];

  return {
    totalSpent: convertToDollarUnit(totalSpent),
    breakdown,
    preset: { label, value: preset ?? "ALL" },
  };
};
