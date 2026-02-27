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
