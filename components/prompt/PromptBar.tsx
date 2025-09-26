"use client";

import React from "react";
import PromptTextarea from "@/components/ui/PromptTextarea";
import { MagnifyingGlassIcon, ArrowRightIcon, SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
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

export default function PromptBar({
  value,
  onChange,
  onSearch,
  tlds = [".com", ".ai", ".io", ".co", ".app", ".dev"],
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch?: (value: string) => void;
  tlds?: string[];
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [improving, setImproving] = React.useState(false);

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
    loop: 0,
    typeSpeed: 26,
    deleteSpeed: 14,
    delaySpeed: 1200,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <div className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-md">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex-1">
          <PromptTextarea
            value={value}
            onChange={onChange}
            name="query"
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            autoComplete="off"
            showAsMultilineAt={72}
            maxRows={6}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            overlay={
              !isFocused && value.length === 0 ? (
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
              {tlds.map((tld, i) => (
                <TLDChip key={tld} label={tld} selected={i === 0} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="btn-rainbow inline-flex shrink-0 rounded-full">
              <button
                type="button"
                onClick={async () => {
                  if (improving) return;
                  const raw = value.trim();
                  if (raw.length < 3) return;
                  setImproving(true);
                  try {
                    const res = await fetch("/api/prompts/improve", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                      },
                      body: JSON.stringify({ prompt: raw }),
                      credentials: "same-origin",
                    });
                    if (res.ok) {
                      const data = (await res.json()) as { improved?: string };
                      if (data?.improved) onChange(data.improved);
                    }
                  } catch {}
                  finally { setImproving(false); }
                }}
                disabled={improving}
                aria-busy={improving}
                className="btn-inner inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none whitespace-nowrap disabled:opacity-60"
              >
                {improving ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SparklesIcon className="h-4 w-4" />
                )}
                {improving ? "Improving…" : "Improve prompt"}
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
  );
}
