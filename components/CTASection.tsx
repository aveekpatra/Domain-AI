import React from "react";
import Container from "./ui/Container";
import Card from "./ui/Card";
import Button from "./ui/Button";

const CTASection: React.FC = () => {
  return (
    <section className="relative py-16">
      <Container>
        <Card variant="light" className="text-center p-8 sm:p-10">
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900">Find your domain today</h3>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Start exploring ideas right away—no account required. Add logic later for live availability and registrar links.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="lg">Search domains</Button>
            <Button size="lg" variant="ghost">Learn more</Button>
          </div>
        </Card>
      </Container>
    </section>
  );
};

export default CTASection;
