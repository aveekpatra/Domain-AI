import React from "react";
import Image from "next/image";
import DomainResultItem, { DomainResult } from "./DomainResultItem";
import { SparklesIcon } from "@heroicons/react/24/outline";

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
  const [likedDomains, setLikedDomains] = React.useState<DomainResult[]>([]);
  const [dislikedDomains, setDislikedDomains] = React.useState<DomainResult[]>([]);
  const [improving, setImproving] = React.useState(false);

  const feedbackCount = likedDomains.length + dislikedDomains.length;

  const handleFeedback = (feedback: 'like' | 'dislike', domain: DomainResult) => {
    if (feedback === 'like') {
      setLikedDomains((prev) => 
        prev.some(d => d.domain === domain.domain && d.tld === domain.tld)
          ? prev
          : [...prev, domain]
      );
      setDislikedDomains((prev) => 
        prev.filter(d => !(d.domain === domain.domain && d.tld === domain.tld))
      );
    } else {
      setDislikedDomains((prev) => 
        prev.some(d => d.domain === domain.domain && d.tld === domain.tld)
          ? prev
          : [...prev, domain]
      );
      setLikedDomains((prev) => 
        prev.filter(d => !(d.domain === domain.domain && d.tld === domain.tld))
      );
    }
  };

  const generateFeedbackPrompt = (): string => {
    const likedNames = likedDomains.map(d => `${d.domain}${d.tld}`).join(', ');
    const dislikedNames = dislikedDomains.map(d => `${d.domain}${d.tld}`).join(', ');
    
    let feedbackPrompt = 'Generate domain names like: ';
    if (likedNames) {
      feedbackPrompt += `user likes these kind of names like ${likedNames}. `;
    }
    if (dislikedNames) {
      feedbackPrompt += `user dislikes these kind of names like ${dislikedNames}. `;
    }
    feedbackPrompt += 'Generate 20 more similar domain names based on this preference.';
    
    return feedbackPrompt;
  };

  const handleImprove = async () => {
    if (improving || feedbackCount < 5) return;
    
    setImproving(true);
    try {
      const feedbackPrompt = generateFeedbackPrompt();
      
      // Redirect to search with the new prompt
      const searchUrl = `/search?prompt=${encodeURIComponent(feedbackPrompt)}`;
      window.location.href = searchUrl;
    } catch (e) {
      console.error("[client] improve failed", e);
      setImproving(false);
    }
  };

  if (!items?.length) return <EmptyState />;
  
  return (
    <>
      {feedbackCount < 5 && items.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-4 w-4 text-slate-500 [html[data-theme='dark']_&]:text-slate-400" />
            <span className="text-sm text-slate-600 [html[data-theme='dark']_&]:text-slate-300">
              Like or dislike results to improve
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden [html[data-theme='dark']_&]:bg-slate-700">
              <div
                className="h-full bg-slate-400 transition-all duration-300 [html[data-theme='dark']_&]:bg-slate-500"
                style={{ width: `${(feedbackCount / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 [html[data-theme='dark']_&]:text-slate-400 whitespace-nowrap">
              {feedbackCount}/5
            </span>
          </div>
        </div>
      )}
      
      {feedbackCount >= 5 && (
        <div className="mb-6 flex items-center justify-center animate-pulse">
          <button
            onClick={handleImprove}
            disabled={improving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-fuchsia-600 disabled:opacity-60 transition-all transform hover:scale-105 active:scale-95 [html[data-theme='dark']_&]:from-sky-600 [html[data-theme='dark']_&]:to-fuchsia-600 [html[data-theme='dark']_&]:hover:from-sky-700 [html[data-theme='dark']_&]:hover:to-fuchsia-700"
          >
            <span>{improving ? "Improving Results..." : "✨ Improve Results"}</span>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {items.map((m) => (
          <DomainResultItem key={`${m.domain}${m.tld}`} item={m} onFeedback={handleFeedback} />
        ))}
      </div>
    </>
  );
};

export default DomainResults;
