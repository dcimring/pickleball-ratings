/**
 * DinkDash Brand Configuration
 * Single Source of Truth for all brand colors, including OKLCH for web
 * and HEX for OpenGraph images and legacy compatibility.
 */

export const BRAND_COLORS = {
  background: {
    oklch: "0.98 0.00 0", // #f9f9f9 (Surface L0)
    hex: "#f9f9f9",
  },
  foreground: {
    oklch: "0.25 0.01 0", // #1a1c1c (On Surface)
    hex: "#1a1c1c",
  },
  primary: {
    oklch: "0.35 0.08 145", // #004b24 (Court Green)
    hex: "#004b24",
    foreground: "0.99 0.01 0", // White
  },
  secondary: {
    oklch: "1.0 0.00 0", // #ffffff (Wimbledon White / Surface L2)
    hex: "#ffffff",
    foreground: "0.25 0.01 0",
  },
  tertiary: {
    oklch: "0.35 0.12 300", // #533072 (Classic Purple)
    hex: "#533072",
    foreground: "0.99 0.01 0",
  },
  muted: {
    oklch: "0.96 0.00 0", // #f3f3f3 (Surface L1)
    hex: "#f3f3f3",
    foreground: "0.25 0.01 0 / 0.5",
  },
  accent: {
    oklch: "0.35 0.08 145", // Court Green
    hex: "#004b24",
    foreground: "1.0 0.00 0",
  },
  destructive: {
    oklch: "0.60 0.20 25",
    hex: "#ef4444",
    foreground: "1.0 0.00 0",
  },
  ghost: {
    oklch: "1.0 0.00 0",
    hex: "#ffffff",
  },
  border: {
    oklch: "0.25 0.01 0 / 0.1",
    hex: "rgba(26, 28, 28, 0.1)",
  },
  input: {
    oklch: "0.96 0.00 0",
  },
  ring: {
    oklch: "0.35 0.08 145",
  },
};
