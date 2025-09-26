import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidateDomainSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rateLimit";
import { checkAvailabilityNamecom } from "@/lib/namecom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsAllowed = (origin?: string | null) => {
  const allow = process.env.ALLOWED_ORIGIN;
  if (!allow) return true;
  if (!origin) return false;
  try {
    const allowed = new URL(allow);
    const got = new URL(origin);
    return allowed.host === got.host;
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
  if (process.env.NODE_ENV !== "production") {
    console.log("[domains.validate] hit", { origin, ip });
  }
  if (!corsAllowed(origin)) {
    if (process.env.NODE_ENV !== "production") console.warn("[domains.validate] blocked by CORS", { origin });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit(req, "domains-validate");
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  // Check for Core API or v4 API credentials
  const usingCore = process.env.NAMECOM_USE_CORE === "true";
  if (!process.env.NAMECOM_USERNAME || !process.env.NAMECOM_API_TOKEN) {
    return NextResponse.json({ 
      error: "Name.com credentials missing",
      hint: usingCore 
        ? "For Core API: Set NAMECOM_USERNAME and NAMECOM_API_TOKEN, plus NAMECOM_USE_CORE=true"
        : "For v4 API: Set NAMECOM_USERNAME and NAMECOM_API_TOKEN"
    }, { status: 500 });
  }

  let input: z.infer<typeof ValidateDomainSchema>;
  try {
    const json = await req.json();
    input = ValidateDomainSchema.parse(json);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || "Invalid input" }, { status: 400 });
  }

  try {
    const domain = input.domain.toLowerCase();
    const map = await checkAvailabilityNamecom([domain]);
    const row = map[domain];
    if (!row) return NextResponse.json({ domain, available: undefined, price: undefined, registrar: "Name.com" });

    let priceStr: string | undefined;
    if (typeof row.registerPrice === "number") {
      priceStr = `$${(row.registerPrice).toFixed(2)}`;
    }

    return NextResponse.json({ domain, available: row.available, price: priceStr, registrar: "Name.com" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== "production") console.error("[domains.validate] error", msg);
    if (msg.includes("v4 check failed: 403") || msg.includes("CORE availability failed: 401") || msg.includes("CORE pricing failed: 401") || msg.includes("CORE availability failed: 403")) {
      const usingCore = process.env.NAMECOM_USE_CORE === "true";
      return NextResponse.json({
        error: "Name.com authentication failed",
        hint: usingCore
          ? "For Core API: Ensure NAMECOM_USERNAME is your account username (not email), NAMECOM_API_TOKEN is valid, and NAMECOM_USE_CORE=true. For testing, use api.dev.name.com with test credentials."
          : "For v4 API: Set NAMECOM_USERNAME to your account username (not email), NAMECOM_API_TOKEN to your API token. For testing, add -test suffix to username and use NAMECOM_API_BASE=https://api.dev.name.com",
        code: "namecom_auth_error"
      }, { status: 502 });
    }
    return NextResponse.json({ error: msg || "Validation failed" }, { status: 500 });
  }
}
