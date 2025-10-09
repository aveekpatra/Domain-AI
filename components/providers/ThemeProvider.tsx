"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "renko-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Try to get theme from localStorage
      const stored = localStorage.getItem(storageKey) as Theme | null;
      const initialTheme = stored || defaultTheme;
      
      // Get the current theme from DOM (set by the blocking script)
      const currentDOMTheme = document.documentElement.getAttribute("data-theme") as ResolvedTheme;
      
      setThemeState(initialTheme);
      setResolvedTheme(currentDOMTheme || "light");
      
      // Only apply theme if it's different from DOM
      if (initialTheme !== "system" && initialTheme !== currentDOMTheme) {
        applyTheme(initialTheme);
      }
      
      setMounted(true);
    } catch (error) {
      // If localStorage fails, use default
      console.warn("Failed to access localStorage for theme:", error);
      setThemeState(defaultTheme);
      const currentDOMTheme = document.documentElement.getAttribute("data-theme") as ResolvedTheme;
      setResolvedTheme(currentDOMTheme || "light");
      setMounted(true);
    }
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.setAttribute("data-theme", systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const applyTheme = (newTheme: Theme) => {
    let resolved: ResolvedTheme;
    
    if (newTheme === "system") {
      // Check system preference
      if (typeof window !== "undefined") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        resolved = "light"; // SSR fallback
      }
    } else {
      resolved = newTheme;
    }

    setResolvedTheme(resolved);
    
    // Apply to document
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", resolved);
    }
  };

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
    
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // If system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  // Always provide context, but with safe defaults during SSR
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for accessing theme in non-React contexts
export function getStoredTheme(storageKey = "renko-theme"): Theme {
  try {
    return (localStorage.getItem(storageKey) as Theme) || "system";
  } catch {
    return "system";
  }
}