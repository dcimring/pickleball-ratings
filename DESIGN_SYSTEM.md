# Design System Guide: DINK Landing Page

Use this guide to replicate the visual identity, color palette, typography, and navigation design of the DINK project.

## 1. Color Palette (OKLCH)
The project uses a dark-themed palette with a high-vibrancy primary accent.

| Variable | OKLCH Value | Description |
| :--- | :--- | :--- |
| `background` | `oklch(0.08 0 0)` | Deep black/gray background |
| `foreground` | `oklch(0.95 0.01 85)` | Off-white text |
| `primary` | `oklch(0.85 0.2 130)` | **Vibrant Lime/Green** (Brand color) |
| `primary-foreground` | `oklch(0.08 0 0)` | Dark text for primary buttons |
| `secondary` | `oklch(0.18 0 0)` | Dark gray for secondary elements |
| `muted` | `oklch(0.2 0 0)` | Faded gray |
| `muted-foreground` | `oklch(0.65 0 0)` | Accessible gray text |
| `border` | `oklch(0.25 0 0)` | Subtle separator color |
| `accent` | `oklch(0.85 0.2 130)` | Same as primary |

## 2. Typography
The site uses a dual-font system to balance technical/modern branding with readability.

- **Headings & Branding (Sans):** `Space Grotesk`
  - Weights: `300`, `400`, `500`, `600`, `700`
  - Characterized by its geometric and technical appearance.
- **Body Text:** `Inter`
  - Standard sans-serif for high legibility.
- **Fallback:** `system-ui, sans-serif`

## 3. Navigation Menu Design
The navigation is designed to be sleek, functional, and "app-like."

### Desktop Design
- **Position:** Fixed to the top (`fixed top-0`).
- **Effect:** `backdrop-blur-md` with 80% background opacity (`bg-background/80`).
- **Height:** `h-16` (64px) on mobile, `h-20` (80px) on desktop.
- **Border:** Subtle bottom border (`border-b border-border`).
- **Links:**
  - Font Size: `text-sm`
  - Font Weight: `font-medium`
  - Color: `text-muted-foreground`
  - Hover: `hover:text-foreground` with `transition-colors`.
- **CTA Buttons:**
  - "Log In": Ghost variant (transparent background, white text).
  - "Join Now": Primary variant (Green background, dark text).

### Mobile Design
- **Trigger:** Hamburger menu (`Menu` and `X` icons from Lucide).
- **Menu:** Full-width dropdown below the header.
- **Layout:** Vertical stack of links with `py-2` padding and `gap-4`.
- **Style:** Includes a top-bordered section for action buttons (Log In/Join Now) at the bottom of the menu.

## 4. UI Elements
- **Radius:** `0.5rem` (Standardized rounded corners).
- **Icons:** `Lucide React` (Stroke width: Default).
- **Buttons:** High-contrast buttons with `px-8 py-6` for a "chunky" premium feel on Hero CTAs.

## 5. Implementation Notes
- **Theme:** Dark mode by default.
- **Container:** Max width of `max-w-7xl` with responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Transitions:** Use `duration-200` or `duration-300` for hover states.
