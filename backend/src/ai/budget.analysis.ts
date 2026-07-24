import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export type BudgetStatusTag = "On Track" | "Watch It" | "Over Budget";

export interface BudgetAnalysisInput {
  budgetId: string;
  categoryName: string;
  budgetLimit: number;
  amountSpent: number;
  percentUsed: number;
  tag: BudgetStatusTag;
  period: "WEEKLY" | "MONTHLY";
}

export interface BudgetAnalysisResult {
  budgetId: string;
  tag: BudgetStatusTag;
  description: string;
}

export function resolveBudgetTag(percentUsed: number): BudgetStatusTag {
  if (percentUsed >= 90) return "Over Budget";
  if (percentUsed >= 70) return "Watch It";
  return "On Track";
}

function fallbackDescription(item: BudgetAnalysisInput): string {
  switch (item.tag) {
    case "On Track":
      return `You're managing your ${item.categoryName} budget well, with ${item.percentUsed.toFixed(1)}% ($${item.amountSpent.toFixed(2)}) spent so far.`;
    case "Watch It":
      return `Your ${item.categoryName} budget is at ${item.percentUsed.toFixed(1)}% ($${item.amountSpent.toFixed(2)}) — keep an eye on spending for the rest of the ${item.period === "WEEKLY" ? "week" : "month"}.`;
    case "Over Budget":
      return `Spending in ${item.categoryName} is a concern at ${item.percentUsed.toFixed(1)}% of your $${item.budgetLimit.toFixed(2)} limit. Consider cutting back.`;
    default: {
      const _exhaustive: never = item.tag;
      return _exhaustive;
    }
  }
}

function buildPrompt(items: BudgetAnalysisInput[]) {
  const payload = items.map((item) => ({
    budgetId: item.budgetId,
    categoryName: item.categoryName,
    budgetLimit: item.budgetLimit,
    amountSpent: item.amountSpent,
    percentUsed: Number(item.percentUsed.toFixed(1)),
    tag: item.tag,
    period: item.period,
  }));

  return `
	You are Finora AI, a concise personal finance coach.

	For each budget below, write a short natural-language analysis (1 to 2 sentences) that matches the provided tag tone:
	- On Track: encouraging
	- Watch It: cautionary
	- Over Budget: urgent / concerning

	Rules:
	- Do not change or invent tags.
	- Mention the category and at least one concrete number when helpful.
	- Return ONLY valid JSON in this exact shape:
	{
	"analyses": [
		{ "budgetId": "string", "description": "string" }
	]
	}

	Budgets:
	${JSON.stringify(payload, null, 2)}
	`.trim();
}

export async function generateBudgetAnalyses(
  items: BudgetAnalysisInput[],
): Promise<BudgetAnalysisResult[]> {
  if (items.length === 0) return [];

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY ?? "",
      model: "gemini-2.5-flash",
      temperature: 0.3,
    });

    const response = await model.invoke([
      new SystemMessage(
        "You analyze personal budgets and return strict JSON only.",
      ),
      new HumanMessage(buildPrompt(items)),
    ]);

    const content =
      typeof response.content === "string"
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .map((part) =>
                typeof part === "string"
                  ? part
                  : typeof part === "object" && part && "text" in part
                    ? String((part as { text?: unknown }).text ?? "")
                    : "",
              )
              .join("\n")
          : "";

    const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      analyses?: Array<{ budgetId?: string; description?: string }>;
    };

    const byId = new Map(
      (parsed.analyses ?? [])
        .filter((item) => item.budgetId && item.description)
        .map((item) => [item.budgetId as string, item.description as string]),
    );

    return items.map((item) => ({
      budgetId: item.budgetId,
      tag: item.tag,
      description: byId.get(item.budgetId) ?? fallbackDescription(item),
    }));
  } catch {
    return items.map((item) => ({
      budgetId: item.budgetId,
      tag: item.tag,
      description: fallbackDescription(item),
    }));
  }
}
