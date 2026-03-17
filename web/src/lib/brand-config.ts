/**
 * DinkDash Brand Configuration
 * Single Source of Truth for all brand colors, including OKLCH for web
 * and HEX for OpenGraph images and legacy compatibility.
 */

export const BRAND_COLORS = {
  background: {
    oklch: "0.3849 0.1446 261.1",
    hex: "#0f3d8f",
  },
  foreground: {
    oklch: "0.99 0.01 130",
    hex: "#FDFFFC",
  },
  primary: {
    oklch: "0.6716 0.2045 138.62",
    hex: "#47b112",
    foreground: "0.99 0.01 130", // White
  },
  secondary: {
    oklch: "0.4671 0.1921 262.22",
    hex: "#144ec3",
    foreground: "0.99 0.01 130", // White
  },
  muted: {
    oklch: "0.3851 0.1541 262.22",
    hex: "#0f3b94",
    foreground: "0.99 0.01 130 / 0.5",
  },
  accent: {
    oklch: "0.6716 0.2045 138.62",
    hex: "#47b112",
    foreground: "0.10 0.05 160",
  },
  destructive: {
    oklch: "0.60 0.20 25",
    hex: "#ef4444",
    foreground: "0.99 0.01 130",
  },
  ghost: {
    oklch: "0.99 0.01 264",
    hex: "#f8fafc",
  },
  border: {
    oklch: "0.99 0.01 264",
    hex: "rgba(253, 255, 252, 0.1)",
  },
  input: {
    oklch: "0.99 0.01 264",
  },
  ring: {
    oklch: "0.88 0.20 168",
  },
};
