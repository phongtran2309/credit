"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "dim" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const THEME_STORAGE_KEY = "mcc_app_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or system preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (savedTheme && (savedTheme === "dark" || savedTheme === "dim" || savedTheme === "light")) {
      setThemeState(savedTheme);
      applyThemeToDom(savedTheme);
    } else {
      // Default to dark
      setThemeState("dark");
      applyThemeToDom("dark");
    }
    setMounted(true);
  }, []);

  const applyThemeToDom = (newTheme: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    
    // Manage tailwind 'dark' class for compatibility
    if (newTheme === "light") {
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
