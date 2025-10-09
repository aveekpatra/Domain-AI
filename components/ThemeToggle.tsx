"use client";

import React from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/components/providers/ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  const isLight = resolvedTheme === "light";
  
  const getThemeIcon = () => {
    if (theme === "system") {
      return <ComputerDesktopIcon className="h-4 w-4" />;
    }
    return isLight ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />;
  };
  
  const getThemeLabel = () => {
    if (theme === "system") {
      return `System (${resolvedTheme})`;
    }
    return isLight ? "Light" : "Dark";
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Current theme: ${getThemeLabel()}. Click to toggle.`}
      title={`Current theme: ${getThemeLabel()}`}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:focus-visible:ring-slate-400"
    >
      {getThemeIcon()}
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
};

export default ThemeToggle;
