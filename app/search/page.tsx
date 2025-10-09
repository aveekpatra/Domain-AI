"use client";

import React, { Suspense } from "react";
import NavbarLight from "@/components/NavbarLight";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import DomainResults from "@/components/search/DomainResults";
import { DomainResult } from "@/components/search/DomainResultItem";
import PromptBar from "@/components/prompt/PromptBar";
import Skeleton from "@/components/ui/Skeleton";
import RateLimitMessage, { isRateLimitError } from "@/components/RateLimitMessage";

interface RateLimitError {
  error: string;
  message: string;
  retryAfter: number;
  limit: {
    current: number;
    max: number;
    window: string;
  };
  remaining: {
    minute: number;
    hour: number;
    day: number;
  };
}
import { useSearchParams } from "next/navigation";

// Component that uses useSearchParams must be wrapped in Suspense
function SearchContent() {
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<DomainResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = React.useState<RateLimitError | null>(null);
  const params = useSearchParams();

  React.useEffect(() => {
    console.log("[client] SearchPage mount", {
      href: typeof window !== "undefined" ? window.location.href : "ssr",
    });
  }, []);

  const runSearch = React.useCallback(async (q: string) => {
    const prompt = q.trim();
    if (!prompt) return;
    
    // Clear previous errors
    setError(null);
    setRateLimitError(null);
    setLoading(true);
    
    try {
      console.log("[client] runSearch", { prompt });
      const res = await fetch("/api/domains/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          prompt,
          tlds: [".com", ".ai", ".io", ".co", ".app", ".dev"],
          count: 8,
        }),
      });
      
      console.log("[client] generate status", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        
        // Check if it's a rate limit error
        if (res.status === 429 && errorData && isRateLimitError(errorData)) {
          setRateLimitError(errorData);
          return;
        }
        
        // Handle other errors
        const errorText = errorData?.error || errorData?.message || `HTTP ${res.status}`;
        throw new Error(errorText);
      }
      
      const data = (await res.json()) as {
        suggestions: {
          domain: string;
          tld: string;
          score?: number;
          available?: boolean;
          price?: string;
          registrar?: string;
        }[];
      };
      
      console.log(
        "[client] suggestions",
        data.suggestions?.length,
        data.suggestions,
      );
      
      const mapped: DomainResult[] = data.suggestions.map((s) => {
        const tld = s.tld?.startsWith(".") ? s.tld : `.${s.tld}`;
        return {
          domain: s.domain,
          tld,
          available: s.available === true, // enforce boolean
          price: s.price ?? "—", // ensure string
          registrar: s.registrar ?? "Name.com",
          score: typeof s.score === "number" ? s.score : 75,
          length: s.domain.length,
        };
      });
      
      setItems(mapped);
    } catch (e) {
      console.error("[client] generate failed", e);
      setError(e instanceof Error ? e.message : "Failed to generate domains");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const p = params.get("prompt") || "";
    console.log("[client] url prompt", p);
    if (p) {
      setQuery(p);
      runSearch(p);
    }
  }, [params, runSearch]);

  React.useEffect(() => {
    if (items.length) {
      console.log("[client] items updated", items.length);
      console.table(
        items.map((i) => ({
          domain: i.domain + i.tld,
          available: i.available,
          price: i.price,
        })),
      );
    }
  }, [items]);

  // Form submission handler (currently unused)
  // const onSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  // };

  return (
    <>
      <main>
        <section className="relative">
          <Container className="pt-8 pb-6">
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                Search domains
              </h1>
              <p className="mt-1 text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
                Refine your idea and preview brandable domain options with
                real‑world pricing hints.
              </p>

              <PromptBar
                value={query}
                onChange={setQuery}
                onSearch={runSearch}
              />
            </div>
          </Container>
        </section>

        <section className="relative">
          <Container className="pb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                Results
              </h2>
              <div className="text-sm text-slate-500 [html[data-theme='dark']_&]:text-slate-400">
                {loading ? "Loading…" : `${items.length} suggestions`}
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-5 [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6" rounded="rounded-lg" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Skeleton className="h-5 w-28" rounded="rounded-full" />
                      <Skeleton className="h-5 w-24" rounded="rounded-full" />
                      <Skeleton className="h-5 w-20" rounded="rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rateLimitError ? (
              <RateLimitMessage 
                error={rateLimitError}
                onRetry={() => runSearch(query)}
                className="mb-6"
              />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center [html[data-theme='dark']_&]:border-red-700 [html[data-theme='dark']_&]:bg-red-900/20">
                <p className="text-red-700 [html[data-theme='dark']_&]:text-red-300">
                  {error}
                </p>
              </div>
            ) : (
              <DomainResults items={items} />
            )}
          </Container>
        </section>
      </main>
    </>
  );
}

// Loading fallback component
function SearchPageLoading() {
  return (
    <main>
      <section className="relative">
        <Container className="pt-8 pb-6">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
              Search domains
            </h1>
            <p className="mt-1 text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
              Loading search interface...
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 [html[data-theme='dark']_&]:bg-slate-950 [html[data-theme='dark']_&]:text-slate-50">
      <NavbarLight />
      <Suspense fallback={<SearchPageLoading />}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
