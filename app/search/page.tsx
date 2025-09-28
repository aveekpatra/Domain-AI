"use client";

import React from "react";
import NavbarLight from "@/components/NavbarLight";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import DomainResults from "@/components/search/DomainResults";
import { DomainResult } from "@/components/search/DomainResultItem";
import PromptBar from "@/components/prompt/PromptBar";
import Skeleton from "@/components/ui/Skeleton";
import { useSearchParams } from "next/navigation";

const mock: DomainResult[] = [
  { domain: "ledgerleaf", tld: ".com", available: true, price: "$12.99", registrar: "Namecheap", score: 86, length: 10 },
  { domain: "bookkept", tld: ".ai", available: true, price: "$55.00", registrar: "Domain.com", score: 79, length: 8 },
  { domain: "fundfolio", tld: ".io", available: false, price: "$34.00", registrar: "Porkbun", score: 73, length: 9 },
  { domain: "accuflow", tld: ".co", available: true, price: "$22.50", registrar: "Cloudflare", score: 81, length: 8 },
  { domain: "tallies", tld: ".app", available: true, price: "$14.00", registrar: "Google", score: 68, length: 7 },
];

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<DomainResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const params = useSearchParams();

  React.useEffect(() => {
    console.log("[client] SearchPage mount", { href: typeof window !== "undefined" ? window.location.href : "ssr" });
  }, []);

  const runSearch = React.useCallback(async (q: string) => {
    const prompt = q.trim();
    if (!prompt) return;
    setLoading(true);
    try {
      console.log("[client] runSearch", { prompt });
      const res = await fetch("/api/domains/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
        body: JSON.stringify({ prompt, tlds: [".com", ".ai", ".io", ".co", ".app", ".dev"], count: 8 }),
      });
      console.log("[client] generate status", res.status);
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { suggestions: { domain: string; tld: string; score?: number; available?: boolean; price?: string; registrar?: string }[] };
      console.log("[client] suggestions", data.suggestions?.length, data.suggestions);
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
      console.table(items.map(i => ({ domain: i.domain + i.tld, available: i.available, price: i.price })));
    }
  }, [items]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavbarLight />
      <main>
        <section className="relative">
          <Container className="pt-8 pb-6">
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Search domains</h1>
              <p className="mt-1 text-slate-600">Refine your idea and preview brandable domain options with real‑world pricing hints.</p>

              <PromptBar value={query} onChange={setQuery} onSearch={runSearch} />
            </div>
          </Container>
        </section>

        <section className="relative">
          <Container className="pb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Results</h2>
              <div className="text-sm text-slate-500">{loading ? "Loading…" : `${items.length} suggestions`}</div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
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
            ) : (
              <DomainResults items={items} />
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
