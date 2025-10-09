import React from "react";
import Image from "next/image";
import DomainResultItem, { DomainResult } from "./DomainResultItem";

const EmptyState: React.FC = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 [html[data-theme='dark']_&]:border-slate-600 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-400">
    <div className="flex flex-col items-center justify-center space-y-4">
      <Image
        src="/not-found.png"
        alt="No results found"
        width={120}
        height={120}
        className="opacity-60"
      />
      <div>
        <h3 className="text-lg font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
          No domains found
        </h3>
        <p className="mt-1 text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
          Try changing your prompt or search terms to find more domain suggestions.
        </p>
      </div>
    </div>
  </div>
);

const DomainResults: React.FC<{ items: DomainResult[] }> = ({ items }) => {
  if (!items?.length) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((m) => (
        <DomainResultItem key={`${m.domain}${m.tld}`} item={m} />
      ))}
    </div>
  );
};

export default DomainResults;
