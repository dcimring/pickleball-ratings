import type { Config } from "tailwindcss";
import { BRAND_COLORS } from "./src/lib/brand-config";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "oklch(var(--tertiary) / <alpha-value>)",
          foreground: "oklch(var(--tertiary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        ghost: {
          DEFAULT: "oklch(var(--ghost) / <alpha-value>)",
        },
        dinkdash: {
          blue: BRAND_COLORS.background.hex,
          surface: BRAND_COLORS.secondary.hex,
          white: BRAND_COLORS.foreground.hex,
          green: BRAND_COLORS.primary.hex,
        },
        // Legacy colors kept for compatibility during transition
        volt: "oklch(var(--primary))",
        surface: "oklch(var(--secondary))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(function({ addBase }) {
      const rootColors: Record<string, string> = {};
      
      // Automatically generate CSS variables from BRAND_COLORS
      Object.entries(BRAND_COLORS).forEach(([name, color]) => {
        if ('oklch' in color) {
          rootColors[`--${name}`] = color.oklch;
        }
        if ('foreground' in color) {
          rootColors[`--${name}-foreground`] = color.foreground;
        }
      });

      addBase({
        ':root': rootColors,
      });
    }),
  ],
};
export default config;
