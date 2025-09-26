import "server-only";
import { NextRequest } from "next/server";

// Simple in-memory rate limiter (per IP + route). Suitable for a single-node dev/staging.
// For production, replace with durable storage (Redis, Upstash, etc.).
const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 30; // 30 requests per minute per IP per route

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(req: NextRequest, keySuffix: string): { ok: boolean; retryAfter: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const key = `${ip}:${keySuffix}`;
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }

  if (b.count >= MAX_HITS) {
    return { ok: false, retryAfter: Math.max(0, Math.ceil((b.reset - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}
