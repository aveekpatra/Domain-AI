import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";
import Button from "./ui/Button";

const CTASection: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16">
      <Container className="px-4">
        <Card variant="light" className="text-center p-6 sm:p-8 md:p-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
            Find your domain today
          </h3>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto [html[data-theme='dark']_&]:text-slate-400">
            Start exploring ideas right away—no account required. Add logic
            later for live availability and registrar links.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto">
              Search domains
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              Learn more
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  );
};

export default CTASection;
