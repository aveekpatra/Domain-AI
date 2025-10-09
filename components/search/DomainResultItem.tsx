import React from "react";
import Card from "@/components/ui/Card";
import {
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export type DomainResult = {
  domain: string;
  tld: string;
  available: boolean;
  price: string; // "$12.99"
  registrar: string; // "Namecheap"
  score: number; // 0-100
  length: number;
};

const Badge: React.FC<{
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger";
}> = ({ children, tone = "neutral" }) => {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 [html[data-theme='dark']_&]:bg-emerald-900/30 [html[data-theme='dark']_&]:text-emerald-300 [html[data-theme='dark']_&]:border-emerald-700"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700 border-rose-200 [html[data-theme='dark']_&]:bg-rose-900/30 [html[data-theme='dark']_&]:text-rose-300 [html[data-theme='dark']_&]:border-rose-700"
        : "bg-slate-50 text-slate-700 border-slate-200 [html[data-theme='dark']_&]:bg-slate-700 [html[data-theme='dark']_&]:text-slate-300 [html[data-theme='dark']_&]:border-slate-600";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses}`}
    >
      {children}
    </span>
  );
};

const Meter: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  const hue = 100 - Math.round((pct / 100) * 100); // green->yellow->red
  return (
    <div className="h-2 w-28 rounded-full bg-slate-200/70 overflow-hidden [html[data-theme='dark']_&]:bg-slate-700/70">
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, hsl(${hue},70%,55%), hsl(${Math.max(hue - 20, 0)},70%,50%))`,
        }}
      />
    </div>
  );
};

const DomainResultItem: React.FC<{ item: DomainResult }> = ({ item }) => {
  const [state, setState] = React.useState(item);
  const [validating, setValidating] = React.useState(false);
  const tone =
    state.available === true
      ? "success"
      : state.available === false
        ? "danger"
        : ("neutral" as const);
  const cardBorder =
    tone === "success"
      ? "border-emerald-200 [html[data-theme='dark']_&]:border-emerald-700"
      : tone === "danger"
        ? "border-rose-200 [html[data-theme='dark']_&]:border-rose-700"
        : "border-slate-200 [html[data-theme='dark']_&]:border-slate-600";
  const availLabel =
    state.available === true
      ? "Available"
      : state.available === false
        ? "Taken"
        : "Unknown";

  const handleBuyNow = () => {
    const fullDomain = `${state.domain}${state.tld?.startsWith(".") ? state.tld : `.${state.tld}`}`;
    const namecomUrl = `https://www.name.com/domain/search/${encodeURIComponent(fullDomain)}`;
    window.open(namecomUrl, "_blank");
  };

  const doValidate = async () => {
    if (validating) return;
    setValidating(true);
    try {
      const full =
        `${state.domain}${state.tld?.startsWith(".") ? state.tld : `.${state.tld}`}`.toLowerCase();
      console.log("[client] validate", full);
      const res = await fetch("/api/domains/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({ domain: full }),
      });
      console.log("[client] validate status", res.status);
      const data = await res.json();
      console.log("[client] validate data", data);
      if (res.ok) {
        setState((s) => ({
          ...s,
          available: data.available,
          price: data.price ?? s.price,
          registrar: data.registrar ?? s.registrar,
        }));
      }
    } catch (e) {
      console.error("[client] validate failed", e);
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card
      variant="light"
      className={`p-4 sm:p-5 transition-shadow hover:shadow-md border ${cardBorder}`}
    >
      <div className="flex flex-col gap-4">
        {/* Domain Name & Icon */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-200 to-fuchsia-200 [html[data-theme='dark']_&]:from-sky-800 [html[data-theme='dark']_&]:to-fuchsia-800">
              <GlobeAltIcon className="h-4 w-4 text-slate-600 [html[data-theme='dark']_&]:text-slate-400" />
            </span>
            <h3 className="truncate text-base sm:text-lg text-slate-900 font-semibold [html[data-theme='dark']_&]:text-slate-100">
              {state.domain}
              <span className="text-slate-400 [html[data-theme='dark']_&]:text-slate-500">
                {state.tld?.startsWith(".") ? state.tld : `.${state.tld}`}
              </span>
            </h3>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={tone}>
              {state.available === true ? (
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
              ) : state.available === false ? (
                <XCircleIcon className="h-4 w-4 shrink-0" />
              ) : null}
              {availLabel}
            </Badge>
            <Badge>
              <TagIcon className="h-4 w-4 shrink-0" /> {state.price ?? "—"}
            </Badge>
            <Badge>
              <ShieldCheckIcon className="h-4 w-4 shrink-0" /> {state.registrar}
            </Badge>
            <Badge>Len {state.length}</Badge>
          </div>
        </div>

        {/* Brandability & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-200/50 [html[data-theme='dark']_&]:border-slate-700/50">
          {/* Brandability Score */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 [html[data-theme='dark']_&]:text-slate-400 shrink-0">
              Brandability
            </p>
            <div className="flex items-center gap-2">
              <Meter value={state.score} />
              <span className="text-sm font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                {state.score}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={doValidate}
              disabled={validating}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap [html[data-theme='dark']_&]:border-slate-600 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-700"
            >
              {validating ? (
                <span className="inline-flex items-center justify-center gap-1">
                  <ArrowPathIcon className="h-4 w-4 animate-spin shrink-0" />
                  <span>Validating…</span>
                </span>
              ) : (
                "Validate"
              )}
            </button>
            {state.available === true && (
              <button
                onClick={handleBuyNow}
                className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap [html[data-theme='dark']_&]:border-emerald-700 [html[data-theme='dark']_&]:bg-emerald-900/30 [html[data-theme='dark']_&]:text-emerald-300 [html[data-theme='dark']_&]:hover:bg-emerald-800/50"
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <ShoppingCartIcon className="h-4 w-4 shrink-0" />
                  <span>Buy Now</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DomainResultItem;
