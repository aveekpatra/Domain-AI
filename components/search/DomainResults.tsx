import React from "react";
import DomainResultItem, { DomainResult } from "./DomainResultItem";

const EmptyState: React.FC = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
    No results yet. Try changing your prompt or filters.
  </div>
);

const DomainResults: React.FC<{ items: DomainResult[] }>=({ items })=>{
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
