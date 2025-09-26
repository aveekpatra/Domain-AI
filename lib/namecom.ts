import "server-only";

// Prefer CORE API if NAMECOM_TOKEN is set, fallback to legacy v4 if only username/token present.
// Core API uses Basic Auth with username:token, same as v4
const CORE_BASE = process.env.NAMECOM_CORE_API || "https://api.name.com";
const V4_BASE = process.env.NAMECOM_API_BASE || "https://api.name.com/v4";

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

// Core API combines availability and pricing in one call, so we don't need a separate pricing endpoint
// If we need detailed pricing, we can use the same checkAvailability endpoint
async function corePricing(domains: string[]) {
  // The checkAvailability endpoint already returns pricing info
  // So we'll just call it again if needed (or we could cache the results)
  return coreAvailability(domains);
}

async function v4Check(domains: string[]) {
  const url = `${V4_BASE}/domains:check`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify({ domainNames: domains }),
  });
  if (!res.ok) throw new Error(`name.com v4 check failed: ${res.status}`);
  return res.json() as Promise<{ domains?: { domainName: string; available?: boolean; purchasePrice?: number; currency?: string }[] }>;
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
  const v4 = await v4Check(domains);
  for (const d of v4.domains || []) {
    map[d.domainName.toLowerCase()] = {
      domainName: d.domainName,
      available: d.available,
      currency: d.currency,
      registerPrice: typeof d.purchasePrice === "number" ? d.purchasePrice / 100 : undefined,
    };
  }
  return map;
}
