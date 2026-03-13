# Design System Guide: DinkDash (Tonal Blue)

Use this guide to replicate the visual identity, color palette, typography, and navigation design of the DinkDash project.

## 1. Color Palette (OKLCH)
The project uses a tonal layering approach with a midnight blue base and a high-vibrancy action green.

| Variable | OKLCH Value | Hex Code | Description |
| :--- | :--- | :--- | :--- |
| `background` | `0.38 0.18 268` | `#1247b1` | **Primary Base Background** |
| `foreground` | `0.99 0.01 130` | `#FDFFFC` | **Typography/Icons** (High-legibility White) |
| `primary` | `0.66 0.20 142` | `#47b112` | **Action Green** (Success/CTA/Trends) |
| `secondary` | `0.42 0.20 268` | `#144ec3` | **Surface Accent** |
| `muted` | `0.32 0.16 268` | `#0f3b94` | Muted/Background variant |
| `muted-foreground` | `0.99 0.01 130 / 0.5` | `rgba(253, 255, 252, 0.5)` | Inactive text/icons |
| `destructive` | `0.60 0.20 25` | - | **Error/Negative Trend** |
| `border` | `0.99 0.01 264 / 0.1` | `rgba(253, 255, 252, 0.1)` | Subtle separator color |
| `ghost` | `0.99 0.01 264` | - | Very light blue/white |

## 2. Typography
The site uses **Space Grotesk** for all textual content to maintain a tech-forward, modern aesthetic.

- **Primary Font:** `Space Grotesk`
  - Weights: `300`, `400`, `500`, `600`, `700` (Bold)
  - Characterized by its geometric and technical appearance.
  - Headings: Bold weight, `tracking-tighter`.
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
  - Color: `text-muted-foreground` (50% opacity)
  - Hover: `hover:text-foreground` with `transition-colors`.

### Mobile Design
- **Trigger:** Hamburger menu (`Menu` and `X` icons from Lucide).
- **Menu:** Full-width dropdown below the header.
- **Layout:** Vertical stack of links with `py-2` padding and `gap-4`.
- **Style:** Includes a top-bordered section for action buttons at the bottom of the menu.

## 4. UI Elements
- **Corner Radius:** `1rem` (16px) standardized rounded corners on all cards and buttons.
- **Borders:** Subtle 1px borders using `var(--border)` to define edges without heavy shadows.
- **Icons:** `Lucide React` (Stroke width: Default).

## 5. Implementation Notes
- **Theme:** Blue/Green dark mode by default.
- **Container:** Max width of `max-w-7xl` with responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Transitions:** Use `duration-200` or `duration-300` for hover states.
- **Charts:** Line charts use `#FDFFFC` (foreground) for primary data lines and `#238145` (primary) for success indicators.
