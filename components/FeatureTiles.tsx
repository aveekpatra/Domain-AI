import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";

const items = [
  {
    title: "AI suggestions",
    desc: "Clever, brandable names tailored to your business",
  },
  {
    title: "Registrar prices",
    desc: "Compare .com, .ai, .io, and more in one view",
  },
  {
    title: "Brandability score",
    desc: "Short, pronounceable, and memorable suggestions",
  },
  {
    title: "Availability preview",
    desc: "See live-ish availability hints by TLD",
  },
  {
    title: "Collections",
    desc: "Save your favorite names for later",
  },
  {
    title: "Bulk checker",
    desc: "Paste a list and check across multiple TLDs",
  },
];

const FeatureTiles: React.FC = () => {
  return (
    <section id="features" className="relative py-12 sm:py-16">
      <Container className="px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <Card key={f.title} variant="light" className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] [html[data-theme='dark']_&]:shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                <div>
                  <h3 className="text-slate-900 font-semibold [html[data-theme='dark']_&]:text-slate-100">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 [html[data-theme='dark']_&]:text-slate-400">
                    {f.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeatureTiles;
