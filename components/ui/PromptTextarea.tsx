"use client";

import React from "react";

interface PromptTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string;
  onChange: (v: string) => void;
  leftIcon?: React.ReactNode;
  showAsMultilineAt?: number; // character count to start showing multiple rows feeling
  minRows?: number;
  maxRows?: number;
  overlay?: React.ReactNode;
}

const PromptTextarea: React.FC<PromptTextareaProps> = ({
  value,
  onChange,
  leftIcon,
  placeholder,
  showAsMultilineAt = 64,
  minRows = 1,
  maxRows = 6,
  overlay,
  className = "",
  ...props
}) => {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight || "24");
    const maxHeight = lineHeight * maxRows;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
  }, [value, maxRows]);

  const multiline = value.length >= showAsMultilineAt;

  const classes = [
    "w-full rounded-xl bg-white text-slate-900 placeholder:text-slate-500",
    "border border-slate-200",
    "focus:outline-none focus:border-slate-300",
    "px-4 py-3",
    leftIcon ? "pl-11" : "",
    multiline ? "min-h-[3.25rem]" : "",
    "resize-none leading-6",
    "[html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:placeholder:text-slate-400",
    "[html[data-theme='dark']_&]:border-slate-600",
    "[html[data-theme='dark']_&]:focus:border-slate-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-3 text-slate-500 [html[data-theme='dark']_&]:text-slate-400">
          {leftIcon}
        </span>
      )}
      <textarea
        ref={ref}
        rows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={classes}
        {...props}
      />
      {overlay}
    </div>
  );
};

export default PromptTextarea;
