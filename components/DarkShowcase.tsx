import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";

const DarkShowcase: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16">
      <Container className="px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
            Beautiful, minimal results
          </h2>
          <p className="mt-2 text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
            Sleek cards designed for focus—no clutter.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="light" className="p-0">
            <div className="border-b border-slate-200/70 px-5 py-4 [html[data-theme='dark']_&]:border-slate-700/70">
              <p className="text-sm text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
                Suggested domains
              </p>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {[
                  "ledgerleaf.com",
                  "bookkept.ai",
                  "fundfolio.io",
                  "tallies.dev",
                  "accuflow.co",
                ].map((d, i) => (
                  <li
                    key={d}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 [html[data-theme='dark']_&]:border-slate-700/70 [html[data-theme='dark']_&]:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-medium break-all">{d}</span>
                    </div>
                    <span className="text-slate-600 text-sm [html[data-theme='dark']_&]:text-slate-400 sm:text-right">
                      Brandability {85 - i * 6}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card variant="light" className="p-0">
            <div className="border-b border-slate-200/70 px-5 py-4 [html[data-theme='dark']_&]:border-slate-700/70">
              <p className="text-sm text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
                Registrar snapshot
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[".com", ".ai", ".io", ".co", ".app", ".dev"].map((tld, i) => (
                  <div
                    key={tld}
                    className="rounded-xl border border-slate-200/70 bg-white/70 px-3 sm:px-4 py-3 [html[data-theme='dark']_&]:border-slate-700/70 [html[data-theme='dark']_&]:bg-slate-800/70"
                  >
                    <p className="text-slate-900 font-medium [html[data-theme='dark']_&]:text-slate-100">
                      {tld}
                    </p>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 [html[data-theme='dark']_&]:text-slate-400">
                      from ${(12 + i * 3).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3 [html[data-theme='dark']_&]:text-slate-500">
                Pricing and availability are examples only.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default DarkShowcase;
