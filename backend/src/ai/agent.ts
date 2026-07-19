import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import type { SessionMessage } from "./session.store.js";
import { buildAgentTools } from "./tool.js";

const AGENT_SYSTEM_PROMPT = `
You are Finora AI, a production-grade personal finance assistant and financial advisor.

Core responsibilities:
1) Manage user transactions via tools.
2) Provide structured analytics for weekly, monthly, or yearly periods.
3) Generate and send monthly email reports.
4) Provide practical financial guidance on budgeting, saving, debt management, investing basics, and financial planning.

Mandatory behavior:
- Always use tools for data operations; do not fabricate transactions or analytics.
- Never access or modify data outside the authenticated user context.
- Ask concise follow-up questions when required fields are missing.
- For destructive actions (delete/bulk delete), confirm intent if user input is ambiguous.
- For general finance questions that do not require database access, provide clear, actionable educational guidance without calling tools.
- When giving advice, explain trade-offs, suggest step-by-step actions, and tailor guidance to the user's context when available.
- Do not claim to be a licensed financial advisor. Avoid legal/tax guarantees and suggest consulting a professional for regulated decisions.
- Return concise, professional output with:
  - plain-language summary
  - structured "data" section when analytical or transactional output is present

Formatting:
- Return plain text only.
- Do not use markdown, code blocks, symbols for formatting, JSON, XML, or tables.
- Keep responses conversational, concise, and human-readable for non-technical users.
- Preserve numeric precision from tool outputs.
- If a tool returns an error, explain the reason and provide the next valid action in simple plain text.
`.trim();

function extractText(response: unknown): string {
  const maybe = response as {
    messages?: Array<{ content?: unknown }>;
    output?: unknown;
  };
  const lastMessage = maybe.messages?.at(-1);
  const content = lastMessage?.content;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in (part as Record<string, unknown>)
        ) {
          return String((part as Record<string, unknown>).text ?? "");
        }
        return "";
      })
      .join("\n")
      .trim();
    if (text) return text;
  }
  if (typeof maybe.output === "string") return maybe.output;
  return "I could not generate a response for this request.";
}

function toAgentMessages(history: SessionMessage[], message: string) {
  return [
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user" as const, content: message },
  ];
}

export async function runFinoraAgent(params: {
  userId: string;
  message: string;
  history: SessionMessage[];
}) {
  const tools = buildAgentTools(params.userId);
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY ?? "",
    model: "gemini-2.5-flash",
    temperature: 0.1,
  });

  const agent = createAgent({
    model,
    tools,
    systemPrompt: AGENT_SYSTEM_PROMPT,
  });

  const response = await agent.invoke({
    messages: toAgentMessages(params.history, params.message),
  });

  return {
    text: extractText(response),
    raw: response,
  };
}
