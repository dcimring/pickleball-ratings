/**
 * CAYMANDINK Brand Configuration — "Broadcast" system.
 * Single source of truth for all brand colors, including OKLCH for web
 * and HEX for OpenGraph images and legacy compatibility.
 *
 * Court-blue board, condensed numerals, Volt for live/up moves, coral for down moves.
 * The Tailwind plugin injects every `oklch` value as a CSS variable.
 */

export const BRAND_COLORS = {
  background: {
    oklch: "0.49 0.125 255", // #2861a5 (Court — ground)
    hex: "#2861a5",
  },
  foreground: {
    oklch: "0.967 0.004 157", // #f2f5f3 (Text)
    hex: "#f2f5f3",
  },
  primary: {
    oklch: "0.931 0.229 123", // #ccff00 (Volt) — primary action + live accent
    hex: "#ccff00",
    foreground: "0.25 0.07 258", // Navy ink
  },
  secondary: {
    oklch: "0.415 0.115 257", // #1d4b89 (Surface — cards, boards)
    hex: "#1d4b89",
    foreground: "0.967 0.004 157",
  },
  tertiary: {
    oklch: "0.931 0.229 123", // #ccff00 (Volt)
    hex: "#ccff00",
    foreground: "0.25 0.07 258",
  },
  muted: {
    oklch: "0.455 0.12 256", // #235698 (Surface 2 — nested tiles)
    hex: "#235698",
    foreground: "0.9 0.035 248", // #cde1f5 (Muted text)
  },
  accent: {
    oklch: "0.931 0.229 123", // Volt
    hex: "#ccff00",
    foreground: "0.25 0.07 258",
  },
  destructive: {
    oklch: "0.82 0.12 38", // #ffa88b (Coral — down moves, lightened for blue)
    hex: "#ffa88b",
    foreground: "0.25 0.07 258",
  },
  ghost: {
    oklch: "0.415 0.115 257",
    hex: "#1d4b89",
  },
  border: {
    oklch: "0.967 0.004 157 / 0.14",
    hex: "rgba(242, 245, 243, 0.14)",
  },
  input: {
    oklch: "0.415 0.115 257",
  },
  ring: {
    oklch: "0.931 0.229 123",
  },
};

/** Hex shortcuts for places that can't use CSS variables (next/og images). */
export const OG_COLORS = {
  ground: BRAND_COLORS.background.hex,
  surface: BRAND_COLORS.secondary.hex,
  surface2: BRAND_COLORS.muted.hex,
  text: BRAND_COLORS.foreground.hex,
  muted: "#cde1f5",
  volt: BRAND_COLORS.primary.hex,
  voltInk: "#2f3a1a",
  coral: BRAND_COLORS.destructive.hex,
  hairline: "rgba(255,255,255,0.14)",
};
