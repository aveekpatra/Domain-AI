import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "light" | "outline";
}

const base = "rounded-2xl p-6";
const variants = {
  glass: "glass-card",
  light: "glass-card-light",
  outline: "border border-white/10 bg-transparent",
} as const;

const Card: React.FC<CardProps> = ({ variant = "glass", className = "", ...props }) => {
  const classes = [base, variants[variant], className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
};

export default Card;
