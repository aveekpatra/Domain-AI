import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightNode?: React.ReactNode;
  variant?: "plain" | "glass";
}

const Input: React.FC<InputProps> = ({
  leftIcon,
  rightNode,
  variant = "plain",
  className = "",
  ...props
}) => {
  const base = [
    "w-full rounded-xl text-slate-900 placeholder:text-slate-500",
    "focus:outline-none focus:border-slate-300",
    "px-4 py-3",
    "[html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:placeholder:text-slate-400",
    "[html[data-theme='dark']_&]:focus:border-slate-600",
  ];
  const style =
    variant === "glass"
      ? [
          "bg-white/80 border border-slate-200/70 backdrop-blur-xl [html[data-theme='dark']_&]:bg-slate-800/80 [html[data-theme='dark']_&]:border-slate-700/70",
        ]
      : [
          "bg-white border border-slate-200 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:border-slate-600",
        ];

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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 [html[data-theme='dark']_&]:text-slate-400">
          {leftIcon}
        </span>
      )}
      <input className={classes} {...props} />
      {rightNode && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {rightNode}
        </span>
      )}
    </div>
  );
};

export default Input;
