"use client";

import React from "react";
import Container from "./ui/Container";
import PromptBar from "@/components/prompt/PromptBar";
import { useRouter } from "next/navigation";

const Hero: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  // Form submission handler (currently unused)
  // const onSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  // };

  return (
    <section className="relative overflow-hidden">
      <Container className="pt-8 pb-12 px-4 sm:pt-12 sm:pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-[0_1px_1px_rgba(2,6,23,0.03)] [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-100">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            AI-powered domain discovery
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl [html[data-theme='dark']_&]:text-slate-100">
            Find a brand-worthy domain in seconds
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:mt-4 sm:text-lg [html[data-theme='dark']_&]:text-slate-400 px-4 sm:px-0">
            Describe your business and instantly see clean, available domain
            ideas across popular TLDs.
          </p>
        </div>

        <PromptBar
          value={query}
          onChange={setQuery}
          onSearch={(val) => {
            const q = val?.trim() || query.trim();
            if (!q) return;
            const u = new URL(
              "/search",
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost",
            );
            u.searchParams.set("prompt", q);
            router.push(u.pathname + "?" + u.searchParams.toString());
          }}
        />

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 px-4 sm:px-0">
          {[
            { label: "No signup required", value: "Try instantly" },
            {
              label: "Across major registrars",
              value: "Easy price comparison",
            },
            { label: "AI that gets your brand", value: "Clever names" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center text-sm text-slate-600 [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800/60 [html[data-theme='dark']_&]:text-slate-400"
            >
              <span className="font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                {item.value}
              </span>{" "}
              — {item.label}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
