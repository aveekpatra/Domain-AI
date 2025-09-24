import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GenerateDomainsSchema, DomainSuggestionsResponse } from "@/lib/schemas";
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

function buildSystemPrompt(tlds: string[], count: number) {
  return `You are DomainMonster, an assistant that generates brandable domain name ideas.
Rules:
- Output strictly valid JSON matching this TypeScript type: { "suggestions": {"domain": string, "tld": string, "reason"?: string, "score"?: number }[] }.
- Provide exactly ${count} suggestions.
- Use only these TLDs: ${tlds.join(", ")}
- Prefer short, pronounceable, memorable names; avoid hyphens and numbers.
- Avoid trademarks or real company names.
- Do not include any additional text or code fences.`;
}

const SafeJSON = {
  parse<T>(text: string): T {
    // try direct JSON
    try { return JSON.parse(text) as T; } catch {}
    // find first JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as T; } catch {}
    }
    throw new Error("Failed to parse JSON from model output");
  }
};

export async function POST(req: NextRequest) {
  if (!corsAllowed(req.headers.get("origin"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit(req, "domains-generate");
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  let input: z.infer<typeof GenerateDomainsSchema>;
  try {
    const json = await req.json();
    input = GenerateDomainsSchema.parse(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid input" }, { status: 400 });
  }

  const { prompt, tlds, count } = input;

  try {
    const { text } = await openRouterChat({
      messages: [
        { role: "system", content: buildSystemPrompt(tlds, count) },
        { role: "user", content: prompt },
      ],
      config: {
        apiKey: process.env.OPENROUTER_API_KEY || "",
        siteUrl: process.env.OPENROUTER_SITE_URL,
        appTitle: process.env.OPENROUTER_APP_TITLE || "DomainMonster",
        model: process.env.OPENROUTER_MODEL || "openrouter/gpt-5-nano",
      },
      responseFormatJson: true,
    });

    const parsed = SafeJSON.parse<z.infer<typeof DomainSuggestionsResponse>>(
      text
    );

    const validated = DomainSuggestionsResponse.parse(parsed);
    return NextResponse.json(validated, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to generate domains" },
      { status: 500 }
    );
  }
}
