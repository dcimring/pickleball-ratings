# Design System: Broadcast

Adopted 2026-11-08 with the CAYMANDINK rebrand, replacing the "Grand Slam Editorial"
light theme. Mockups and the two reference directions live on the design canvas
(see memory / project notes). Tokens are defined once in `src/lib/brand-config.ts`
and injected as CSS variables by the Tailwind plugin in `tailwind.config.ts`.

## North star

A dark sports-data board: the numbers are the design. Condensed numerals carry the
hierarchy, Volt marks what is live or rising, coral marks what fell, and everything
else recedes into near-black surfaces. Mobile first: controls never share a row with
a headline on phones.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `background` | `#0b100e` | Ground |
| `secondary` | `#141b18` | Cards, boards, inputs on ground |
| `muted` | `#1b2420` | Nested tiles, hover rows |
| `foreground` | `#f2f5f3` | Text |
| `muted-foreground` | `#9fb0a8` | Labels, secondary text (7:1 on ground) |
| `primary` / `tertiary` / `accent` | `#ccff00` | Volt: primary actions, live dot, up moves, active tab |
| `destructive` | `#ff7a5c` | Coral: down moves, errors |
| `border` | `rgba(242,245,243,0.08)` | Hairlines (via `shadow-hairline`, `shadow-outline`) |

Volt and coral always differ in lightness as well as hue, so up/down is readable without
colour. Text on Volt uses `primary-foreground` (ground) or `#2f3a1a` for secondary copy.

## Type

- **Display / numerals:** Barlow Condensed 600–800 (`font-display`, `--font-display`), uppercase for
  headlines, `tabular-nums` for every metric. Utilities: `.numeral`, `.kicker`.
- **Body / names:** Barlow 400–600 (`font-sans`).
- Scale: page headline 64px phone / 120px desktop; board rating 24–30px; hero rating 84–96px;
  kicker 11–15px with 0.14–0.24em tracking.

## Surfaces and shape

- Radii: 4px (chips, segmented buttons), 6px (inputs, buttons), 10px (cards). `--radius: 0.625rem`.
- No 1px borders. Rows separate with `shadow-hairline`; outlined controls use `shadow-outline`.
- Glow only on the live dot and the scroll-to-top button (`shadow-glow`).

## Components

- `PageHero` — ticker strip (live dot + segments), kicker, headline, lead, controls row.
- `ModeSwitcher` — doubles/singles segmented control; fills the row on phones.
- `DeltaChip` — ▲/▼ movement chip; dash when unknown or unchanged.
- Leader tile, board rows, mover tiles and stat tiles are `bg-secondary rounded-lg` blocks.
- OG images (`opengraph-image.tsx`) use `OG_COLORS` and the same layout language.

## Do / don't

- Do keep deltas honest: show a dash when the previous snapshot is unknown, never a fake zero.
- Do keep tap targets at 44px and labels at 4.5:1 contrast.
- Don't reintroduce gradients, italics or serif display type.
- Don't put a headline and a control group on the same row below `md`.
