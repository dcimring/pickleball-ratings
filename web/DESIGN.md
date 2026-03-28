# Design System Specification: The Grand Slam Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Prestigious Spectator."**

This is not a generic sports tracker; it is a high-end digital program. We are moving away from the "app-grid" aesthetic toward an editorial layout that mirrors the heritage of championship tennis. We achieve this through a "High-End Editorial" lens—utilizing intentional asymmetry, generous white space (the "Wimbledon White"), and a sophisticated interplay between modern functionalism (Sans-Serif) and traditional prestige (Serif).

To break the template look, elements should occasionally "overhang" or bleed off the grid. For instance, a player’s ranking number might overlap the edge of a stats card, or a background "Court Green" section might feature a 15-degree angled cut to evoke the kinetic energy of a serve.

---

## 2. Colors & Surface Philosophy
The palette is rooted in tradition but executed with digital depth. We utilize the Material Design 3 tonal approach to ensure the UI feels layered and tactile.

### The Palette
* **Primary (Court Green):** `#004b24` to `#006633`. This is our anchor. Use it for high-impact brand moments and primary actions.
* **Secondary (Wimbledon White):** `#ffffff`. Not just a background, but a structural element.
* **Tertiary (Classic Purple):** `#533072`. Used sparingly for "Royal" accents—notifications, active states, or premium tier indicators.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Sectioning must be achieved through background shifts. For example, a `surface_container_low` (#f3f3f3) list should sit directly on a `surface` (#f9f9f9) background. Let the tonal difference create the boundary.

### Surface Hierarchy & Nesting
Treat the interface as a series of physical layers.
* **Level 0 (Base):** `surface` (#f9f9f9)
* **Level 1 (Sections):** `surface_container_low` (#f3f3f3)
* **Level 2 (Cards/Interaction):** `surface_container_lowest` (#ffffff)
This creates a "nested" depth where the most important interactive elements (Cards) feel like they are floating slightly above the structural sections.

---

## 3. Typography: The Tension of Eras
The system relies on the contrast between the functional `Inter` and the authoritative `Newsreader`.

* **Display & Headlines (Newsreader):** Use these for player names, tournament titles, and major rankings. The serif evokes the "All England Club" prestige.
* *Scale:* `display-lg` (3.5rem) to `headline-sm` (1.5rem).
* **Titles & Body (Inter):** Use for stats, data labels, and UI controls. It provides the "Sport-Tech" readability required for rapid data consumption.
* *Scale:* `title-lg` (1.375rem) down to `label-sm` (0.6875rem).

**Editorial Tip:** Use "Optical Sizing." Headlines should have tighter letter-spacing (-0.02em) to feel like a printed journal.

---

## 4. Elevation & Depth
We eschew heavy drop shadows in favor of **Tonal Layering** and **Ambient Light**.

* **The Layering Principle:** A card (Surface Lowest) placed on a container (Surface Low) provides enough contrast to be "read" as elevated without a shadow.
* **Ambient Shadows:** If an element must float (e.g., a Modal or a Floating Action Button), use a highly diffused shadow: `box-shadow: 0 12px 32px rgba(0, 75, 36, 0.06);`. Note the green tint in the shadow—this mimics natural light hitting a green court.
* **Glassmorphism:** For the navigation bar or top stats header, use `surface_container_lowest` at 80% opacity with a `backdrop-blur: 12px`. This prevents the UI from feeling "blocked in" and allows the rich Court Green to peak through.
* **The Ghost Border:** If a border is required for accessibility, use `outline_variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Prominent Search Bar
* **Style:** `surface_container_lowest` background, `xl` (1.5rem) roundedness.
* **Execution:** Large padding (`spacing-4`). Instead of a standard "Search" label, use "Find a Player or Tournament..." in `body-lg`. Use a subtle `primary` tint for the icon.

### Stats Cards
* **Style:** `surface_container_lowest` background, `DEFAULT` (0.5rem) roundedness.
* **Rule:** Forbid divider lines. Use `spacing-4` vertical gaps between data points.
* **Visuals:** Use small `primary_container` sparklines for performance trends.

### Data Tables (The Ranking Grid)
* **Separation:** Use alternating row colors: `surface` and `surface_container_low`.
* **Typography:** Rank numbers in `headline-md` (Newsreader); player names in `title-md` (Inter).
* **The "Wimbledon Stripe":** A 4px vertical accent of `tertiary` (Purple) on the left edge of the "Top Seed" or "Current User" row.

### Buttons
* **Primary:** `primary` background (#004b24), `on_primary` text. Use a subtle linear gradient from `primary` to `primary_container` to give it a "pressed grass" texture.
* **Secondary:** `outline` ghost button with a `sm` (0.25rem) radius.
* **Tertiary:** Text-only with `tertiary` (#533072) coloring, reserved for "View All" or "Filter" actions.

---

## 6. Do’s and Don’ts

### Do:
* **Use White Space as a Luxury:** Give stats room to breathe. High-end design is defined by what you *don't* cram onto the screen.
* **Embrace Asymmetry:** Align headline text to the left but place secondary stats in the bottom-right of a card to create a dynamic visual path.
* **Use Tonal Transitions:** Transition from `primary` to `primary_dark` for hero sections to create a sense of stadium depth.

### Don’t:
* **Don't use 1px Dividers:** They clutter the "spectator" experience. Use `spacing-8` or a subtle background shift instead.
* **Don't use Pure Black:** Use `on_surface` (#1a1c1c) for text to maintain a softer, more sophisticated contrast.
* **Don't Over-Round:** Stick to the `DEFAULT` (8px) for cards. Avoid "Pill" shapes for everything except Search Bars and Chips to maintain a professional, architectural feel.
