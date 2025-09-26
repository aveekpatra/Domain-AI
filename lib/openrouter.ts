import "server-only";

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

  const body: Record<string, unknown> = {
    model: model || process.env.OPENROUTER_MODEL || "openrouter/auto",
    messages,
  };
  if (responseFormatJson) {
    // Best-effort JSON mode if supported
    body.response_format = { type: "json_object" };
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[openrouter] request", { model: body.model, messages: messages.length, json: !!body.response_format });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
      ...(appTitle ? { "X-Title": appTitle } : {}),
    },
    body: JSON.stringify(body),
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[openrouter] response status", res.status);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (process.env.NODE_ENV !== "production") console.error("[openrouter] error body", errText);
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText} ${errText}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenRouter returned empty response");

  return { text };
}
