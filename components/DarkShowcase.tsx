import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";

const DarkShowcase: React.FC = () => {
  return (
    <section className="relative py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Beautiful, minimal results</h2>
          <p className="mt-2 text-slate-600">Sleek cards designed for focus—no clutter.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="light" className="p-0">
            <div className="border-b border-slate-200/70 px-5 py-4">
              <p className="text-sm text-slate-600">Suggested domains</p>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {["ledgerleaf.com", "bookkept.ai", "fundfolio.io", "tallies.dev", "accuflow.co"].map((d, i) => (
                  <li key={d} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-900">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium">{d}</span>
                    </div>
                    <span className="text-slate-600 text-sm">Brandability {85 - i * 6}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card variant="light" className="p-0">
            <div className="border-b border-slate-200/70 px-5 py-4">
              <p className="text-sm text-slate-600">Registrar snapshot</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[".com", ".ai", ".io", ".co", ".app", ".dev"].map((tld, i) => (
                  <div key={tld} className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3">
                    <p className="text-slate-900 font-medium">{tld}</p>
                    <p className="text-slate-600 text-sm mt-1">from ${(12 + i * 3).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3">Pricing and availability are examples only.</p>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default DarkShowcase;
