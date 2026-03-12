## Brand Style Guide: **DinkDash**

### 1. Color Architecture

This palette relies on **tonal layering**. Instead of high-contrast black, we use varying luminances of the primary blue to create depth.

| Element | Hex Code | Role |
| --- | --- | --- |
| **Primary Base** | `#144EC3` | **Background:** The foundation layer of the entire application. |
| **Surface Accent** | `#1C5ED9` | **Cards/Containers:** A slightly lighter shade of the base blue used for dashboard modules to create elevation. |
| **Typography** | `#FDFFFC` | **Text/Icons:** High-legibility white for all critical data and navigation. |
| **Action Color** | `#238145` | **Success/CTA:** Used for buttons, "Up" trends, and live status indicators. |

---

### 2. Typography

To maintain the tech-forward, modern look of the mockup:

* **Primary Font:** **Space Grotesk**
* **Headings:** Bold weight, `tracking-tighter` (decreased letter spacing) for a compact, punchy feel.
* **Data Points:** Medium weight. Space Grotesk's tabular figures make it excellent for displaying rankings and scores.


* **Fallback:** System Sans-Serif.

---

### 3. Visual Style & UI Components

#### **The "Glass & Depth" Rule**

Since the background and cards are similar in hue, use the following to ensure the UI is scannable:

* **Borders:** Use a subtle 1px border on cards with a color like `rgba(253, 255, 252, 0.1)` to define edges without adding heavy shadows.
* **Corner Radius:** High rounding (**12px to 16px**) on all cards and buttons to match the friendly yet modern aesthetic.

#### **Data Visualization**

* **Line Charts:** Use `#FDFFFC` for the primary data line.
* **Success Metrics:** Use `#238145` for progress bars or "Win" indicators.
* **Neutral Icons:** Use `#FDFFFC` at **50% opacity** for inactive navigation items to keep the focus on the active page.

---

### 4. Updated Tailwind Configuration

You can update your previous config to reflect this "Midnight Navy-free" version:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        dinkdash: {
          blue: '#144EC3',      // Base Background
          surface: '#1C5ED9',   // Card Surface
          white: '#FDFFFC',     // Text
          green: '#238145',     // Actions
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
}

```

