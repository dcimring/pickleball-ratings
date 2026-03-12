# Design System Guide: DinkDash (Tonal Blue)

Use this guide to replicate the visual identity, color palette, typography, and navigation design of the DinkDash project.

## 1. Color Palette (OKLCH)
The project uses a tonal layering approach with a midnight blue base and a high-vibrancy action green.

| Variable | OKLCH Value | Hex Code | Description |
| :--- | :--- | :--- | :--- |
| `background` | `0.44 0.22 258` | `#144EC3` | **Primary Base Background** |
| `foreground` | `0.99 0.01 130` | `#FDFFFC` | **Typography/Icons** (High-legibility White) |
| `primary` | `0.52 0.17 155` | `#238145` | **Action Green** (Success/CTA/Trends) |
| `secondary` | `0.50 0.23 255` | `#1C5ED9` | **Surface Accent** (Cards/Containers) |
| `muted` | `0.40 0.20 258` | `#1144AA` | Muted/Background variant |
| `muted-foreground` | `0.99 0.01 130 / 0.5` | `rgba(253, 255, 252, 0.5)` | Inactive text/icons |
| `border` | `0.99 0.01 130 / 0.1` | `rgba(253, 255, 252, 0.1)` | Subtle separator color |

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
