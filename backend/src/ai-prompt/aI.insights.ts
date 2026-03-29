import { reportInsightPrompt } from "./prompt";
import { genAI, genAIModel } from "./ai.config";
import { convertToDollarUnit } from "../lib/format.currency";

export async function generateInsightsAI({
	totalIncome,
	totalExpenses,
	availableBalance,
	savingsRate,
	categories,
	periodLabel,
}: {
	totalIncome: number;
	totalExpenses: number;
	availableBalance: number;
	savingsRate: number;
	categories: Record<string, { amount: number; percentage: number }>;
	periodLabel: string;
}) {
	try {
		const prompt = reportInsightPrompt({
			totalIncome: convertToDollarUnit(totalIncome),
			totalExpenses: convertToDollarUnit(totalExpenses),
			availableBalance: convertToDollarUnit(availableBalance),
			savingsRate: Number(savingsRate.toFixed(1)),
			categories,
			periodLabel,
		});

		const result = await genAI.models.generateContent({
			model: genAIModel,
			contents: prompt,
			config: { responseMimeType: "application/json" },
		});

		const response = result.text;
		const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

		if (!cleanedText) return [];

		const data = JSON.parse(cleanedText);
		return data;
	} catch (_error) {
		return [];
	}
}
