import React from "react";
import Card from "@/components/ui/Card";
import { CheckCircleIcon, XCircleIcon, TagIcon, ShieldCheckIcon, GlobeAltIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export type DomainResult = {
  domain: string;
  tld: string;
  available: boolean;
  price: string; // "$12.99"
  registrar: string; // "Namecheap"
  score: number; // 0-100
  length: number;
};

const Badge: React.FC<{ children: React.ReactNode; tone?: "neutral" | "success" | "danger" }>=({ children, tone="neutral" })=>{
  const toneClasses = tone === "success"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : tone === "danger"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
};

const Meter: React.FC<{ value: number }>=({ value })=>{
  const pct = Math.max(0, Math.min(100, value));
  const hue = 100 - Math.round((pct/100)*100); // green->yellow->red
  return (
    <div className="h-2 w-28 rounded-full bg-slate-200/70 overflow-hidden">
      <div className="h-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, hsl(${hue},70%,55%), hsl(${Math.max(hue-20,0)},70%,50%))` }} />
    </div>
  );
};

const DomainResultItem: React.FC<{ item: DomainResult }>=({ item })=>{
  const [state, setState] = React.useState(item);
  const [validating, setValidating] = React.useState(false);
  const tone = state.available === true ? "success" : state.available === false ? "danger" : "neutral" as const;
  const cardBorder = tone === "success" ? "border-emerald-200" : tone === "danger" ? "border-rose-200" : "border-slate-200";
  const availLabel = state.available === true ? "Available" : state.available === false ? "Taken" : "Unknown";

  const doValidate = async () => {
    if (validating) return;
    setValidating(true);
    try {
      const full = `${state.domain}${state.tld?.startsWith('.') ? state.tld : `.${state.tld}`}`.toLowerCase();
      console.log("[client] validate", full);
      const res = await fetch("/api/domains/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
        body: JSON.stringify({ domain: full }),
      });
      console.log("[client] validate status", res.status);
      const data = await res.json();
      console.log("[client] validate data", data);
      if (res.ok) {
        setState((s) => ({ ...s, available: data.available, price: data.price ?? s.price, registrar: data.registrar ?? s.registrar }));
      }
    } catch (e) {
      console.error("[client] validate failed", e);
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card variant="light" className={`p-5 transition-shadow hover:shadow-md border ${cardBorder}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-sky-200 to-fuchsia-200">
              <GlobeAltIcon className="h-4 w-4 text-slate-600" />
            </span>
            <h3 className="truncate text-slate-900 font-semibold">
              {state.domain}
              <span className="text-slate-400">{state.tld?.startsWith('.') ? state.tld : `.${state.tld}`}</span>
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={tone}>
              {state.available === true ? <CheckCircleIcon className="h-4 w-4" /> : state.available === false ? <XCircleIcon className="h-4 w-4" /> : null}
              {availLabel}
            </Badge>
            <Badge>
              <TagIcon className="h-4 w-4" /> {state.price ?? "—"}
            </Badge>
            <Badge>
              <ShieldCheckIcon className="h-4 w-4" /> {state.registrar}
            </Badge>
            <Badge>
              Len {state.length}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:pl-6">
          <div className="text-right">
            <p className="text-xs text-slate-500">Brandability</p>
            <div className="mt-1 flex items-center gap-2">
              <Meter value={state.score} />
              <span className="text-sm font-medium text-slate-900">{state.score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={doValidate} disabled={validating} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60">
              {validating ? (
                <span className="inline-flex items-center gap-1"><ArrowPathIcon className="h-4 w-4 animate-spin" /> Validating…</span>
              ) : (
                "Validate"
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DomainResultItem;
