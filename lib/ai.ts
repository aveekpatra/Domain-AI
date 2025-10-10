import "server-only";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export type OpenRouterConfig = {
  apiKey: string;
  siteUrl?: string;
  appTitle?: string;
  model?: string;
};

export async function openRouterChat({
  messages,
  config,
  responseFormatJson = false,
}: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  config: OpenRouterConfig;
  responseFormatJson?: boolean;
}): Promise<{ text: string }> {
  const { apiKey, siteUrl, appTitle, model } = config;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const openrouter = createOpenRouter({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
      ...(appTitle ? { "X-Title": appTitle } : {}),
    },
  });

  const modelName =
    model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (process.env.NODE_ENV !== "production") {
    console.log("[ai] request", {
      model: modelName,
      messages: messages.length,
      json: responseFormatJson,
    });
  }

  try {
    const result = await generateText({
      model: openrouter(modelName),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...(responseFormatJson && {
        output: "object" as const,
      }),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[ai] response status", 200);
    }

    // Extract text from result
    let text: string;
    if (responseFormatJson && typeof result.object === "object") {
      text = JSON.stringify(result.object);
    } else {
      text = result.text;
    }

    if (!text) throw new Error("AI returned empty response");

    return { text };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ai] error", error);
    }

    // Re-throw with consistent error format
    if (error instanceof Error) {
      throw new Error(`AI error: ${error.message}`);
    }
    throw new Error("AI error: Unknown error occurred");
  }
}
