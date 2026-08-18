import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vib: {
          blue: "#004B91",
          gold: "#F3A100",
          sky: "#00A3E0",
          dark: "#0a192f",
          cardDark: "#112240",
        },
      },
    },
  },
  plugins: [],
};
export default config;
