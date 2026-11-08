/**
 * CAYMANDINK Brand Configuration — "Broadcast" system.
 * Single source of truth for all brand colors, including OKLCH for web
 * and HEX for OpenGraph images and legacy compatibility.
 *
 * Dark board, condensed numerals, Volt for live/up moves, coral for down moves.
 * The Tailwind plugin injects every `oklch` value as a CSS variable.
 */

export const BRAND_COLORS = {
  background: {
    oklch: "0.167 0.009 169", // #0b100e (Ground)
    hex: "#0b100e",
  },
  foreground: {
    oklch: "0.967 0.004 157", // #f2f5f3 (Text)
    hex: "#f2f5f3",
  },
  primary: {
    oklch: "0.931 0.229 123", // #ccff00 (Volt) — primary action + live accent
    hex: "#ccff00",
    foreground: "0.167 0.009 169", // Ground
  },
  secondary: {
    oklch: "0.214 0.012 167", // #141b18 (Surface — cards, boards)
    hex: "#141b18",
    foreground: "0.967 0.004 157",
  },
  tertiary: {
    oklch: "0.931 0.229 123", // #ccff00 (Volt)
    hex: "#ccff00",
    foreground: "0.167 0.009 169",
  },
  muted: {
    oklch: "0.250 0.015 166", // #1b2420 (Surface 2 — nested tiles)
    hex: "#1b2420",
    foreground: "0.742 0.022 166", // #9fb0a8 (Muted text, 7:1 on ground)
  },
  accent: {
    oklch: "0.931 0.229 123", // Volt
    hex: "#ccff00",
    foreground: "0.167 0.009 169",
  },
  destructive: {
    oklch: "0.729 0.169 34", // #ff7a5c (Coral — down moves)
    hex: "#ff7a5c",
    foreground: "0.167 0.009 169",
  },
  ghost: {
    oklch: "0.214 0.012 167",
    hex: "#141b18",
  },
  border: {
    oklch: "0.967 0.004 157 / 0.08",
    hex: "rgba(242, 245, 243, 0.08)",
  },
  input: {
    oklch: "0.167 0.009 169",
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
  muted: "#9fb0a8",
  volt: BRAND_COLORS.primary.hex,
  voltInk: "#2f3a1a",
  coral: BRAND_COLORS.destructive.hex,
  hairline: "rgba(255,255,255,0.08)",
};
