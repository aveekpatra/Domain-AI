"use client";

import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

function getNextTheme(current: string | null): "light" | "dark" {
  if (current === "light") return "dark";
  if (current === "dark") return "light";
  // default to dark first
  return "light";
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = React.useState<string | null>(null);

  React.useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = getNextTheme(theme);
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:shadow-md"
    >
      {isLight ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{isLight ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggle;
