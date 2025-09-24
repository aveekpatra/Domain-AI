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
    "bg-white/90 text-slate-900 hover:bg-white shadow-lg shadow-black/10 rounded-xl border border-white/20 shimmer",
  secondary:
    "bg-slate-800/60 text-white hover:bg-slate-800 rounded-xl border border-white/10",
  ghost: "bg-transparent text-white hover:bg-white/10 rounded-xl border border-white/10",
} as const;

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const classes = ["inline-flex items-center justify-center font-medium", sizes[size], variants[variant], className]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
};

export default Button;
