"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "warm-dark" | "neutral" | "warm-light";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "warm-dark",
  setTheme: () => {},
});

export const THEME_STORAGE_KEY = "mcc_app_theme";

// Normalize legacy keys if any
export function normalizeTheme(val: string | null): ThemeMode {
  if (val === "warm-dark" || val === "neutral" || val === "warm-light") {
    return val;
  }
  if (val === "dark") return "warm-dark";
  if (val === "dim") return "neutral";
  if (val === "light") return "warm-light";
  return "warm-dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("warm-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const validTheme = normalizeTheme(saved);
    setThemeState(validTheme);
    applyThemeToDom(validTheme);
    setMounted(true);
  }, []);

  const applyThemeToDom = (newTheme: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    
    // Manage tailwind 'dark' class for compatibility
    if (newTheme === "warm-light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeToDom(newTheme);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("theme_changed", { detail: newTheme }));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
