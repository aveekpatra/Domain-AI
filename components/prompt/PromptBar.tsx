"use client";

import React from "react";
import PromptTextarea from "@/components/ui/PromptTextarea";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTypewriter, Cursor } from "react-simple-typewriter";

const StyleChip: React.FC<{ 
  label: string; 
  selected?: boolean; 
  onClick?: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={[
      "px-3 py-1.5 rounded-full text-sm border transition-colors",
      selected
        ? "bg-slate-900 text-white border-slate-900 shadow-sm [html[data-theme='dark']_&]:bg-slate-100 [html[data-theme='dark']_&]:text-slate-900 [html[data-theme='dark']_&]:border-slate-100"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-300 [html[data-theme='dark']_&]:border-slate-600 [html[data-theme='dark']_&]:hover:bg-slate-700",
    ].join(" ")}
  >
    {label}
  </button>
);

export default function PromptBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch?: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [improving, setImproving] = React.useState(false);
  const [selectedStyle, setSelectedStyle] = React.useState<string>("brandable");

  const nameStyles = [
    { key: "brandable", label: "Brandable", prompt: " (make it brandable and catchy)" },
    { key: "descriptive", label: "Descriptive", prompt: " (make it descriptive and clear)" },
    { key: "compound", label: "Compound", prompt: " (use compound words)" },
    { key: "abbreviated", label: "Abbreviated", prompt: " (use abbreviations or short forms)" },
  ];

  const handleStyleChange = (styleKey: string) => {
    setSelectedStyle(styleKey);
    const style = nameStyles.find(s => s.key === styleKey);
    if (style) {
      // Remove any existing style prompts
      let cleanValue = value;
      nameStyles.forEach(s => {
        cleanValue = cleanValue.replace(s.prompt, "");
      });
      // Add the new style prompt
      onChange(cleanValue.trim() + style.prompt);
    }
  };

  const examples = React.useMemo(
    () => [
      "AI bookkeeping for startups",
      "Find a snappy name for a fitness coaching app",
      "Domain ideas for a privacy-first email service",
      "Catchy .ai names for an LLM-powered chatbot",
    ],
    [],
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
    <div className="mt-4 w-full max-w-full rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-md overflow-hidden [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800">
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
                <div className="pointer-events-none absolute left-11 top-3 right-3 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap [html[data-theme='dark']_&]:text-slate-400">
                  <span>{typed}</span>
                  <Cursor cursorStyle="|" />
                </div>
              ) : null
            }
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm overflow-x-auto scrollbar-none [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800">
              {nameStyles.map((style) => (
                <StyleChip 
                  key={style.key} 
                  label={style.label} 
                  selected={selectedStyle === style.key}
                  onClick={() => handleStyleChange(style.key)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto overflow-hidden">
            <div className="btn-rainbow inline-flex shrink-0 rounded-full w-full sm:w-auto">
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
                  } catch {
                  } finally {
                    setImproving(false);
                  }
                }}
                disabled={improving}
                aria-busy={improving}
                className="btn-inner inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none whitespace-nowrap disabled:opacity-60 w-full sm:w-auto [html[data-theme='dark']_&]:bg-slate-700 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-600"
              >
                {improving ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <SparklesIcon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {improving ? "Improving…" : "Improve prompt"}
                </span>
                <span className="sm:hidden">
                  {improving ? "Improving…" : "Improve"}
                </span>
              </button>
            </div>
            <div className="btn-rainbow inline-flex shrink-0 rounded-full w-full sm:w-auto">
              <button
                type="submit"
                className="btn-inner group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none whitespace-nowrap w-full sm:w-auto [html[data-theme='dark']_&]:bg-slate-100 [html[data-theme='dark']_&]:text-slate-900 [html[data-theme='dark']_&]:hover:bg-slate-200"
              >
                <span className="truncate">Search domains</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 arrow-animate group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
