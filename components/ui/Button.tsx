import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-sm px-3 py-2",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
} as const;

const variants = {
  primary:
    "bg-white/90 text-slate-900 hover:bg-white shadow-lg shadow-black/10 rounded-xl border border-white/20 shimmer [html[data-theme='dark']_&]:bg-slate-800/90 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800 [html[data-theme='dark']_&]:shadow-black/20 [html[data-theme='dark']_&]:border-slate-700/20",
  secondary:
    "bg-slate-800/60 text-white hover:bg-slate-800 rounded-xl border border-white/10 [html[data-theme='dark']_&]:bg-slate-700/60 [html[data-theme='dark']_&]:text-slate-200 [html[data-theme='dark']_&]:hover:bg-slate-700 [html[data-theme='dark']_&]:border-slate-600/20",
  ghost:
    "bg-transparent text-white hover:bg-white/10 rounded-xl border border-white/10 [html[data-theme='dark']_&]:text-slate-200 [html[data-theme='dark']_&]:hover:bg-slate-700/20 [html[data-theme='dark']_&]:border-slate-600/20",
} as const;

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const classes = [
    "inline-flex items-center justify-center font-medium",
    sizes[size],
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
};

export default Button;
