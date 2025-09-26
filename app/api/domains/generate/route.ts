import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GenerateDomainsSchema, DomainSuggestionsResponse } from "@/lib/schemas";
import { openRouterChat } from "@/lib/openrouter";
import { rateLimit } from "@/lib/rateLimit";
import { checkAvailabilityNamecom } from "@/lib/namecom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsAllowed = (origin?: string | null) => {
  const allow = process.env.ALLOWED_ORIGIN;
  if (!allow) return true; // allow all if not configured
  if (!origin) return true; // allow requests without origin (e.g., same-origin)
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
- The "domain" field should contain ONLY the domain name WITHOUT the TLD extension (e.g., "ChicEthos", not "ChicEthos.com")
- The "tld" field should contain the TLD extension (e.g., ".com", ".ai", ".io")
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
  const origin = req.headers.get("origin");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
  if (process.env.NODE_ENV !== "production") {
    console.log("[domains.generate] hit", { origin, ip });
  }
  if (!corsAllowed(origin)) {
    if (process.env.NODE_ENV !== "production") console.warn("[domains.generate] blocked by CORS", { origin });
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
    if (process.env.NODE_ENV !== "production") console.log("[domains.generate] input", { promptLen: input.prompt.length, tlds: input.tlds, count: input.count });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== "production") console.error("[domains.generate] invalid input", msg);
    return NextResponse.json({ error: msg || "Invalid input" }, { status: 400 });
  }

  const { prompt, tlds, count } = input;

  try {
    if (process.env.NODE_ENV !== "production") console.log("[domains.generate] calling openrouter");
    const { text } = await openRouterChat({
      messages: [
        { role: "system", content: buildSystemPrompt(tlds, count) },
        { role: "user", content: prompt },
      ],
      config: {
        apiKey: process.env.OPENROUTER_API_KEY || "",
        siteUrl: process.env.OPENROUTER_SITE_URL,
        appTitle: process.env.OPENROUTER_APP_TITLE || "DomainMonster",
        model: process.env.OPENROUTER_MODEL || undefined,
      },
      responseFormatJson: true,
    });

    if (process.env.NODE_ENV !== "production") console.log("[domains.generate] openrouter text len", text.length);
    const parsed = SafeJSON.parse<z.infer<typeof DomainSuggestionsResponse>>(
      text
    );

    const validated = DomainSuggestionsResponse.parse(parsed);
    if (process.env.NODE_ENV !== "production") console.log("[domains.generate] suggestions count", validated.suggestions.length);

    // Enrich with availability from name.com
    try {
      if (!process.env.NAMECOM_USERNAME || !process.env.NAMECOM_API_TOKEN) {
        if (process.env.NODE_ENV !== "production") console.warn("[domains.generate] skip name.com enrichment (missing env), returning basic suggestions");
        // Return basic suggestions without availability check
        const basicSuggestions = validated.suggestions.map((s) => ({
          ...s,
          available: undefined, // unknown availability
          price: undefined,
          registrar: "Name.com",
        }));
        return NextResponse.json({ suggestions: basicSuggestions }, { status: 200 });
      }
      const fullDomains = validated.suggestions.map((s) => {
        const t = s.tld?.startsWith(".") ? s.tld : `.${s.tld}`;
        return `${s.domain}${t}`.toLowerCase();
      });
      const unique = Array.from(new Set(fullDomains));
      if (process.env.NODE_ENV !== "production") console.log("[domains.generate] checking name.com", { batch: unique.length });
      const availability = await checkAvailabilityNamecom(unique);
      if (process.env.NODE_ENV !== "production") console.log("[domains.generate] name.com results", { entries: Object.keys(availability).length });

      // Enrich with availability info but don't filter - show all suggestions
      const enriched = validated.suggestions.map((s) => {
        const t = s.tld?.startsWith(".") ? s.tld : `.${s.tld}`;
        const key = `${s.domain}${t}`.toLowerCase();
        const a = availability[key];
        let priceStr: string | undefined;
        if (typeof a?.registerPrice === "number") {
          priceStr = `$${(a.registerPrice).toFixed(2)}`;
        }
        return {
          ...s,
          available: typeof a?.available === "boolean" ? a.available : undefined,
          price: priceStr,
          registrar: a ? "Name.com" : s.registrar,
        };
      });
      if (process.env.NODE_ENV !== "production") console.log("[domains.generate] enriched suggestions", { total: enriched.length, available: enriched.filter(s => s.available === true).length });
      return NextResponse.json({ suggestions: enriched }, { status: 200 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (process.env.NODE_ENV !== "production") console.error("[domains.generate] name.com enrich failed", msg);
      // If name.com fails, return basic suggestions without availability check
      const basicSuggestions = validated.suggestions.map((s) => ({
        ...s,
        available: undefined, // unknown availability
        price: undefined,
        registrar: "Name.com",
      }));
      return NextResponse.json({ suggestions: basicSuggestions }, { status: 200 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== "production") console.error("[domains.generate] error", msg);
    return NextResponse.json(
      { error: msg || "Failed to generate domains" },
      { status: 500 }
    );
  }
}
