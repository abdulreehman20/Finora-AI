export type ReportType = {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  // Todo: This is updates spending as per last project
  topSpendingCategories: Array<{
    name: string;
    amount: number;
    percent: number;
  }>;
  insights: string[];
};

// Last Project Report Type
// export type ReportType = {
// 	period: string;
// 	totalIncome: number;
// 	totalExpenses: number;
// 	availableBalance: number;
// 	savingsRate: number;
// 	topSpendingCategories: Array<{ name: string; percent: number }>;
// 	insights: string[];
// };
