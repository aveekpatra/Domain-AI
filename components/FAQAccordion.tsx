"use client";

import React, { useState } from "react";
import Container from "./ui/Container";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How does DomainMonster help me find the perfect domain?",
    answer:
      "DomainMonster uses advanced AI to generate creative, relevant domain names based on your business idea or keywords. It instantly checks availability and shows pricing from multiple registrars, saving you hours of research.",
  },
  {
    question: "Do I need an account to search for domains?",
    answer:
      "No account required to start! You can explore and generate domain ideas immediately. Create an account later if you want to save favorites or proceed with registration.",
  },
  {
    question: "Can I filter domains by price or extension?",
    answer:
      "Yes! Filter results by top-level domain (.com, .io, .co, etc.), price range, and domain length. Whether you're looking for premium short domains or budget-friendly alternatives, we've got you covered.",
  },
  {
    question: "What registrars do you support?",
    answer:
      "We integrate with leading registrars to show you competitive pricing and availability. Click any domain to register directly through your preferred registrar with our affiliate links.",
  },
  {
    question: "Is this tool good for branding agencies?",
    answer:
      "Absolutely! Agencies use DomainMonster to research multiple name options for clients, compare pricing across registrars, and validate branding choices—all in one place.",
  },
  {
    question: "How often is the domain availability data updated?",
    answer:
      "Our availability data is checked in real-time when you search. This ensures you're always seeing current information and can immediately register available domains before they're taken.",
  },
];

const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-12 sm:py-16">
      <Container className="px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight [html[data-theme='dark']_&]:text-slate-50">
              Questions? We&apos;ve got answers
            </h2>
            <p className="mt-2 text-base text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
              Everything you need to know about DomainMonster
            </p>
          </div>

          {/* Accordion Items */}
          <div className="space-y-2.5">
            {faqItems.map((item, index) => (
              <button
                key={index}
                onClick={() => toggleAccordion(index)}
                className="w-full text-left"
              >
                <div
                  className={`rounded-lg border backdrop-blur-xl transition-all duration-300 ${
                    openIndex === index
                      ? "border-slate-300/50 bg-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.08)] [html[data-theme='dark']_&]:border-slate-600 [html[data-theme='dark']_&]:bg-slate-800/80 [html[data-theme='dark']_&]:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "border-slate-200/70 bg-white/50 hover:bg-white/60 hover:border-slate-250/50 [html[data-theme='dark']_&]:border-slate-700/60 [html[data-theme='dark']_&]:bg-slate-800/40 [html[data-theme='dark']_&]:hover:bg-slate-800/50 [html[data-theme='dark']_&]:hover:border-slate-600/50"
                  }`}
                >
                  {/* Question */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug [html[data-theme='dark']_&]:text-slate-100">
                      {item.question}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      } [html[data-theme='dark']_&]:text-slate-400`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </div>

                  {/* Answer */}
                  {openIndex === index && (
                    <div className="border-t border-slate-200/50 px-5 py-4 sm:px-6 sm:py-5 [html[data-theme='dark']_&]:border-slate-700/50">
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed [html[data-theme='dark']_&]:text-slate-400">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FAQAccordion;
