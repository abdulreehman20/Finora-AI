export type ReportType = {
	period: string;
	totalIncome: number;
	totalExpenses: number;
	availableBalance: number;
	savingsRate: number;
	topSpendingCategories: Array<{
		name: string;
		amount: number;
		percent: number;
	}>;
	/** Per-budget usage for the reporting period */
	budgetBreakdown: Array<{
		categoryName: string;
		spent: number;
		budgeted: number;
		percentUsed: number;
	}>;
	/** Transaction lines included in the period */
	transactions: Array<{
		title: string;
		categoryName: string;
		type: string;
		amount: number;
		date: string;
	}>;
	insights: string[];
};
