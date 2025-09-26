import "server-only";

// Prefer CORE API if NAMECOM_TOKEN is set, fallback to legacy v4 if only username/token present.
// Core API uses Basic Auth with username:token, same as v4
const CORE_BASE = process.env.NAMECOM_CORE_API || "https://api.name.com";
// Ensure the v4 base always includes the /v4 path, even if the env var omits it
const RAW_V4_BASE = process.env.NAMECOM_API_BASE || "https://api.name.com";
const V4_BASE = RAW_V4_BASE.endsWith("/v4") ? RAW_V4_BASE : `${RAW_V4_BASE}/v4`;
const V4_MAX_BATCH = 50;

function basicAuthHeader() {
  const user = process.env.NAMECOM_USERNAME || "";
  const token = process.env.NAMECOM_API_TOKEN || "";
  if (!user || !token) throw new Error("Missing NAMECOM_USERNAME or NAMECOM_API_TOKEN");
  const encoded = Buffer.from(`${user}:${token}`).toString("base64");
  return `Basic ${encoded}`;
}

// Core API also uses Basic Auth, not Bearer
function coreAuthHeader() {
  // Core API uses the same Basic Auth as v4
  return basicAuthHeader();
}

export type NamecomCheckResult = {
  domainName: string;
  available?: boolean;
  premium?: boolean;
  currency?: string;
  registerPrice?: number; // USD
  renewPrice?: number;
};

async function coreAvailability(domains: string[]) {
  // Core API endpoint for checking domain availability
  const url = `${CORE_BASE}/domains:checkAvailability`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: coreAuthHeader(),
    },
    body: JSON.stringify({ 
      domainNames: domains  // Core API uses domainNames, not domains
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`name.com CORE availability failed: ${res.status} - ${errorText}`);
  }
  return res.json() as Promise<{ results: { domainName: string; available?: boolean; premium?: boolean; purchasable?: boolean; purchasePrice?: number; purchaseType?: string; renewalPrice?: number }[] }>;
}

async function v4Check(domains: string[]) {
  const url = `${V4_BASE}/domains:checkAvailability`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify({ domainNames: domains }),
  });
  if (!res.ok) {
    let bodyText = "";
    try { bodyText = await res.text(); } catch {}
    const hint = res.status === 403
      ? "Hint: Ensure Basic Auth uses username (not email) + API token, Content-Type is application/json, Two-Factor Authentication is disabled, and the base URL includes /v4 (e.g., https://api.name.com/v4)."
      : "";
    throw new Error(`name.com v4 checkAvailability failed: ${res.status} - ${bodyText || "No response body"}${hint ? `\n${hint}` : ""}`);
  }
  return res.json() as Promise<{ results?: { domainName: string; purchasable?: boolean; purchasePrice?: number; renewalPrice?: number; currency?: string }[] }>;
}

async function v4CheckBatch(domains: string[]) {
  const all: { domainName: string; purchasable?: boolean; purchasePrice?: number; renewalPrice?: number; currency?: string }[] = [];
  for (let i = 0; i < domains.length; i += V4_MAX_BATCH) {
    const chunk = domains.slice(i, i + V4_MAX_BATCH);
    const resp = await v4Check(chunk);
    if (resp.results && resp.results.length) {
      all.push(...resp.results);
    }
  }
  return { results: all };
}

export async function checkAvailabilityNamecom(domains: string[]): Promise<Record<string, NamecomCheckResult>> {
  if (!domains.length) return {};
  const map: Record<string, NamecomCheckResult> = {};

  // Use Core API if NAMECOM_USE_CORE is set, otherwise use v4
  if (process.env.NAMECOM_USE_CORE === "true") {
    // CORE flow: checkAvailability returns both availability and pricing
    try {
      const response = await coreAvailability(domains);
      for (const r of response.results || []) {
        const domainKey = r.domainName.toLowerCase();
        map[domainKey] = {
          domainName: r.domainName,
          available: r.available,
          premium: r.premium,
          currency: "USD",
          // Core API returns prices in cents, convert to dollars
          registerPrice: typeof r.purchasePrice === "number" ? r.purchasePrice / 100 : undefined,
          renewPrice: typeof r.renewalPrice === "number" ? r.renewalPrice / 100 : undefined,
        };
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[namecom] Core API failed", e);
      throw e; // Re-throw to handle in the calling function
    }
    return map;
  }

  // Legacy v4 fallback
  const v4 = await v4CheckBatch(domains);
  for (const d of v4.results || []) {
    map[d.domainName.toLowerCase()] = {
      domainName: d.domainName,
      available: typeof d.purchasable === "boolean" ? d.purchasable : undefined,
      currency: d.currency,
      registerPrice: typeof d.purchasePrice === "number" ? d.purchasePrice : undefined,
      renewPrice: typeof d.renewalPrice === "number" ? d.renewalPrice : undefined,
    };
  }
  return map;
}
