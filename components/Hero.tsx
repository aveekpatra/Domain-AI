"use client";

import React from "react";
import Container from "./ui/Container";
import PromptBar from "@/components/prompt/PromptBar";
import { useRouter } from "next/navigation";


const Hero: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative overflow-hidden">
      <Container className="pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-[0_1px_1px_rgba(2,6,23,0.03)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            AI-powered domain discovery
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Find a brand-worthy domain in seconds
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Describe your business and instantly see clean, available domain ideas across popular TLDs.
          </p>
        </div>

        <PromptBar
          value={query}
          onChange={setQuery}
          onSearch={(val) => {
            const q = val?.trim() || query.trim();
            if (!q) return;
            const u = new URL("/search", typeof window !== "undefined" ? window.location.origin : "http://localhost");
            u.searchParams.set("prompt", q);
            router.push(u.pathname + "?" + u.searchParams.toString());
          }}
        />

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "No signup required", value: "Try instantly" },
            { label: "Across major registrars", value: "Easy price comparison" },
            { label: "AI that gets your brand", value: "Clever names" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center text-sm text-slate-600"
            >
              <span className="font-medium text-slate-900">{item.value}</span> — {item.label}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
