import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";

const items = [
  {
    title: "Startups",
    desc: "Validate names and secure a matching domain fast.",
  },
  {
    title: "Indie hackers",
    desc: "Find short, clean names that pass the vibe check.",
  },
  {
    title: "Agencies",
    desc: "Research client options with side-by-side pricing.",
  },
];

const UseCases: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16">
      <Container className="px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
            Made for builders
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
            Whether you ship solo or at scale, the right name matters.
          </p>
        </div>
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <Card key={i.title} variant="light">
              <h3 className="text-slate-900 font-semibold [html[data-theme='dark']_&]:text-slate-100">
                {i.title}
              </h3>
              <p className="text-slate-600 text-sm mt-1 [html[data-theme='dark']_&]:text-slate-400">
                {i.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default UseCases;
