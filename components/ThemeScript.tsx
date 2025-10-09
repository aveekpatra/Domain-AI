"use client";

import { useEffect } from "react";

// This script runs before React hydration to prevent FOUC
const themeScript = `
(function() {
  try {
    const storageKey = 'renko-theme';
    const theme = localStorage.getItem(storageKey) || 'system';
    
    let resolvedTheme;
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }
    
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  } catch (e) {
    // If localStorage fails, fall back to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function ThemeScript() {
  useEffect(() => {
    // This component doesn't render anything, it's just for the script injection
  }, []);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}