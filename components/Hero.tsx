"use client";

import React from "react";
import Container from "./ui/Container";
import PromptTextarea from "./ui/PromptTextarea";
import { MagnifyingGlassIcon, ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTypewriter, Cursor } from "react-simple-typewriter";

const TLDChip: React.FC<{ label: string; selected?: boolean }> = ({ label, selected }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={[
      "px-3 py-1.5 rounded-full text-sm border transition-colors",
      selected
        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
    ].join(" ")}
  >
    {label}
  </button>
);

const Hero: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const examples = React.useMemo(
    () => [
      "AI bookkeeping for startups",
      "Find a snappy name for a fitness coaching app",
      "Domain ideas for a privacy-first email service",
      "Catchy .ai names for an LLM-powered chatbot",
    ],
    []
  );

  const [typed] = useTypewriter({
    words: examples,
    loop: 0, // infinite
    typeSpeed: 26,
    deleteSpeed: 14,
    delaySpeed: 1200,
  });

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

<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-md">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="flex-1">
              <PromptTextarea
                value={query}
                onChange={setQuery}
                name="query"
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                autoComplete="off"
                showAsMultilineAt={72}
                maxRows={6}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                overlay={
                  !isFocused && query.length === 0 ? (
                    <div className="pointer-events-none absolute left-11 top-3 text-slate-500 whitespace-nowrap">
                      <span>{typed}</span>
                      <Cursor cursorStyle="|" />
                    </div>
                  ) : null
                }
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  {['.com', '.ai', '.io', '.co', '.app', '.dev'].map((tld, i) => (
                    <TLDChip key={tld} label={tld} selected={i === 0} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="btn-rainbow inline-flex shrink-0 rounded-full">
                  <button
                    type="button"
                    className="btn-inner inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none whitespace-nowrap"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Improve prompt
                  </button>
                </span>
                <span className="btn-rainbow inline-flex shrink-0 rounded-full">
                  <button
                    type="submit"
                    className="btn-inner group inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none whitespace-nowrap max-w-[220px]"
                  >
                    Search domains
                    <ArrowRightIcon className="h-4 w-4 arrow-animate group-hover:translate-x-1 transition-transform" />
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>

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
