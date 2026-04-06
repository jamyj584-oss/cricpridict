import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F1115", // Deep Navy/Black
        secondary: "#161B22", // Card Surface
        accent: "#7698FB", // Primary Blue
        success: "#4ADE80",
        danger: "#F87171",
        textMain: "#FFFFFF", // Pure White
        textMuted: "#94A3B8", // Slate 400
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
        'gradient-accent': 'linear-gradient(135deg, #7698FB 0%, #4B73E1 100%)',
        'gradient-banner': 'linear-gradient(135deg, #7698FB 0%, #1A2234 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
