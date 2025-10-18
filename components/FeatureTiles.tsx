"use client";

import React from "react";
import Container from "./ui/Container";
import {
  SparklesIcon,
  CurrencyDollarIcon,
  StarIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

const ACCENT = {
  emerald: {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    borderHover: "group-hover:border-emerald-500/30",
    via: "via-emerald-500/30",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    borderHover: "group-hover:border-blue-500/30",
    via: "via-blue-500/30",
  },
  amber: {
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    borderHover: "group-hover:border-amber-500/30",
    via: "via-amber-500/30",
  },
  rose: {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    borderHover: "group-hover:border-rose-500/30",
    via: "via-rose-500/30",
  },
  purple: {
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    borderHover: "group-hover:border-purple-500/30",
    via: "via-purple-500/30",
  },
  indigo: {
    text: "text-indigo-500",
    bg: "bg-indigo-500/10",
    borderHover: "group-hover:border-indigo-500/30",
    via: "via-indigo-500/30",
  },
} as const;

const items = [
  {
    id: 1,
    title: "AI suggestions",
    desc: "Clever, brandable names tailored to your business",
    Icon: SparklesIcon,
    accent: "emerald",
  },
  {
    id: 2,
    title: "Registrar prices",
    desc: "Compare .com, .ai, .io, and more in one view",
    Icon: CurrencyDollarIcon,
    accent: "blue",
  },
  {
    id: 3,
    title: "Brandability score",
    desc: "Short, pronounceable, and memorable suggestions",
    Icon: StarIcon,
    accent: "amber",
  },
  {
    id: 4,
    title: "Availability preview",
    desc: "See live-ish availability hints by TLD",
    Icon: MagnifyingGlassIcon,
    accent: "rose",
  },
  {
    id: 5,
    title: "Collections",
    desc: "Save your favorite names for later",
    Icon: BookmarkIcon,
    accent: "purple",
    badge: "Coming Soon",
  },
  {
    id: 6,
    title: "Bulk checker",
    desc: "Paste a list and check across multiple TLDs",
    Icon: BoltIcon,
    accent: "indigo",
  },
] as const;

const FeatureTiles: React.FC = () => {
  return (
    <section id="features" className="relative py-12 sm:py-16 overflow-hidden">
      <Container className="px-4">
        {/* Section header */}
        <div className="mb-10 max-w-3xl mx-auto text-center mt-8 sm:mt-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight [html[data-theme='dark']_&]:text-slate-50">
            Powerful tools to discover your perfect domain
          </h2>
          <p className="mt-2 text-base text-slate-600 [html[data-theme='dark']_&]:text-slate-400 mx-auto leading-relaxed">
            Everything you need to find, compare, and register the ideal domain for your brand.
          </p>
        </div>

        {/* Mindful, dense bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {items.map((item, idx) => {
            const accent = ACCENT[item.accent];
            const { Icon } = item;
            const gridClass =
              idx === 0
                ? "lg:col-span-6"
                : idx === 1
                ? "lg:col-span-3"
                : idx === 2
                ? "lg:col-span-3"
                : "lg:col-span-4";
            return (
              <div key={item.id} className={`${gridClass} h-44 sm:h-48`}>
                <div
                  className={`h-full p-6 rounded-xl border border-slate-200/70 bg-white/70 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.12)] hover:scale-[1.01] ${accent.borderHover} [html[data-theme='dark']_&]:bg-slate-800/50 [html[data-theme='dark']_&]:border-slate-700/60 [html[data-theme='dark']_&]:hover:border-slate-600/70 [html[data-theme='dark']_&]:hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]`}
                >
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-md ${accent.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${accent.text}`} />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 [html[data-theme='dark']_&]:text-slate-50">{item.title}</h3>
                    </div>
                    {"badge" in item && item.badge && (
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-200/70 text-slate-700 [html[data-theme='dark']_&]:bg-slate-700/70 [html[data-theme='dark']_&]:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 [html[data-theme='dark']_&]:text-slate-400 mt-3 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className={`mt-4 h-px bg-gradient-to-r from-transparent ${accent.via} to-transparent`} />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FeatureTiles;
