# 🎨 DinkDash Style Guide (Electric Court)

This document defines the visual identity and UI patterns for **dinkdash.xyz**.

---

## 🌈 Color Palette

| Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary BG** | Obsidian | `#020617` | Root background and deep surfaces. |
| **Surface** | Slate Navy | `#0F172A` | Cards, search bars, and secondary backgrounds. |
| **Accent** | **Electric Volt** | `#DFFF00` | Critical actions, rankings, and brand highlights. |
| **Text (Main)** | Ghost White | `#F8FAFC` | Primary headings and body text. |
| **Text (Muted)** | Slate Muted | `rgba(248, 250, 252, 0.4)` | Subtitles, helper text, and decorative labels. |

---

## 🔡 Typography

### **Display Font: Orbitron**
- **Usage**: Brand name (`DINKDASH`), massive hero titles, and rank numbers.
- **Vibe**: Tech-forward, athletic, and high-energy.
- **Attributes**: Black weight (900), wide tracking (`tracking-[0.4em]` for brand).

### **Sans Font: Inter**
- **Usage**: Player names, ratings, search input, and body content.
- **Vibe**: Clean, modern, and highly legible for data tables.
- **Attributes**: Bold weight for player names, Regular/Medium for data.

---

## 📐 Layout & Spacing

### **Vertical Alignment**
- **Header Top Padding**: All main views must start with `pt-6` relative to the sticky navigation bar. This ensures a consistent "eye-line" when switching between different tools or pages.
- **Max Width**: Use `max-w-6xl` for main content containers to maintain optimal line lengths and centered focus on desktop.
- **Horizontal Padding**: Use `px-6` for main containers and `px-4` (mobile) / `px-8` (desktop) for data tables.

### **Navigation & Scroll Management (The "Clean Slate" Pattern)**
To eliminate transition flicker and ensure a premium feel, DinkDash uses an **Internal Scroll** architecture:
1.  **Fixed Viewport**: The root `<main>` tag is locked (`h-screen overflow-hidden`) to prevent the browser window from scrolling.
2.  **Scroll Container**: All views live inside a single `ref={scrollRef}` container that handles scrolling (`flex-1 overflow-y-auto`).
3.  **The "Moment of Zero" Reset**: 
    - Use `<AnimatePresence mode="wait" onExitComplete={handleViewStable}>`.
    - The `handleViewStable` function must forcefully reset `scrollRef.current.scrollTop = 0`.
    - This ensures the previous page fully exits, the scroll is reset while the screen is empty, and the new page enters perfectly at the top.
4.  **Avoid Smooth Scroll**: Disable `scroll-smooth` on the main container to ensure the "Moment of Zero" reset is instantaneous and doesn't conflict with animations.

---

## ✨ UI Components & Effects

### **The "Electric Court" Card**
- **Background**: `surface/50` (transparent navy).
- **Border**: `border-white/5` (subtle definition).
- **Blur**: `backdrop-blur-sm`.
- **Hover**: `hover:bg-white/[0.02]` with smooth color transition to `volt`.

### **Motion & Interaction**
- **Library**: Framer Motion.
- **Stagger**: Row entries reveal with a 0.02s staggered delay.
- **Transitions**: 0.3s duration for tab switches and hover states.

### **Atmospherics**
- **Header Gradient**: A top-centered radial gradient using `rgba(223, 255, 0, 0.15)` fading to transparent.
- **Scrollbar**: Custom Obsidian track with a Volt-colored thumb on hover.

---

## 📱 Mobile Considerations
- **Responsive Sizing**: Rank (`text-xl`), Name (`text-base`), Rating (`text-lg`).
- **Layout**: "ROUNDS" data moves from a dedicated column (desktop) to a badge below the name (mobile).
- **Interaction**: Large tap targets for Singles/Doubles toggle buttons.
