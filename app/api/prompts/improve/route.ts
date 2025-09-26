import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ImprovePromptSchema } from "@/lib/schemas";
import { openRouterChat } from "@/lib/openrouter";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsAllowed = (origin?: string | null) => {
  const allow = process.env.ALLOWED_ORIGIN;
  if (!allow) return true; // allow all if not configured
  if (!origin) return false;
  try {
    const allowed = new URL(allow);
    const got = new URL(origin);
    return allowed.host === got.host;
  } catch {
    return false;
  }
};

function systemPrompt() {
  return `You rewrite user prompts to be clearer and more specific for generating brandable domain name ideas.
Return just the improved prompt as plain text. Keep it concise. Remove sensitive data if present.`;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (process.env.NODE_ENV !== "production") {
    console.log("[improve] hit route", { origin, ip: req.ip });
  }

  if (!corsAllowed(origin)) {
    if (process.env.NODE_ENV !== "production") console.warn("[improve] blocked by CORS", { origin });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit(req, "prompt-improve");
  if (!limited.ok) {
    if (process.env.NODE_ENV !== "production") console.warn("[improve] rate limited", { retryAfter: limited.retryAfter });
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  let input: z.infer<typeof ImprovePromptSchema>;
  try {
    const json = await req.json();
    input = ImprovePromptSchema.parse(json);
    if (process.env.NODE_ENV !== "production") console.log("[improve] input ok", { len: input.prompt.length });
  } catch (e: any) {
    if (process.env.NODE_ENV !== "production") console.error("[improve] invalid input", e?.message);
    return NextResponse.json({ error: e?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    if (process.env.NODE_ENV !== "production") console.log("[improve] calling openrouter", { model: process.env.OPENROUTER_MODEL || "openrouter/gpt-5-nano" });
    const { text } = await openRouterChat({
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: input.prompt },
      ],
      config: {
        apiKey: process.env.OPENROUTER_API_KEY || "",
        siteUrl: process.env.OPENROUTER_SITE_URL,
        appTitle: process.env.OPENROUTER_APP_TITLE || "DomainMonster",
        model: process.env.OPENROUTER_MODEL || undefined,
      },
      responseFormatJson: false,
    });

    if (process.env.NODE_ENV !== "production") console.log("[improve] openrouter ok", { length: text.length });
    // Return trimmed text only
    return NextResponse.json({ improved: text.trim() }, { status: 200 });
  } catch (e: any) {
    if (process.env.NODE_ENV !== "production") console.error("[improve] error", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to improve prompt" },
      { status: 500 }
    );
  }
}
