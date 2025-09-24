import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightNode?: React.ReactNode;
  variant?: "plain" | "glass";
}

const Input: React.FC<InputProps> = ({ leftIcon, rightNode, variant = "plain", className = "", ...props }) => {
  const base = [
    "w-full rounded-xl text-slate-900 placeholder:text-slate-500",
    "focus:outline-none focus:border-slate-300",
    "px-4 py-3",
  ];
  const style =
    variant === "glass"
      ? ["bg-white/80 border border-slate-200/70 backdrop-blur-xl"]
      : ["bg-white border border-slate-200"];

  const classes = [
    ...base,
    ...style,
    leftIcon ? "pl-11" : "",
    rightNode ? "pr-12" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {leftIcon}
        </span>
      )}
      <input className={classes} {...props} />
      {rightNode && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightNode}</span>
      )}
    </div>
  );
};

export default Input;
