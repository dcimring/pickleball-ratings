# 🎯 Project Vision: DinkDash.xyz

A prestigious, editorial data platform for Cayman Islands pickleball players. The hub provides a high-end digital program experience with real-time rank tracking, performance history, and community features, mirroring the heritage of championship tennis.

---

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router) with **Tailwind CSS**.
*   **Design System:** **The Grand Slam Editorial** (Court Green, Wimbledon White, Classic Purple).
*   **Typography:** `Newsreader` (Serif/Editorial) and `Inter` (Sans/Functional).
*   **Icons:** **Lucide React**.
*   **Animations:** **Framer Motion**.
*   **Database:** Supabase (PostgreSQL).
*   **Scraper:** Google Apps Script (GAS) using Delta Logic.
*   **Deployment:** Vercel.

---

## 📐 Architecture & Standards

### 1. Design System (The Grand Slam Editorial)
*   **Colors:** Rooted in tradition with digital depth.
    *   **Primary (Court Green):** `#004b24`
    *   **Secondary (Wimbledon White):** `#ffffff`
    *   **Tertiary (Classic Purple):** `#533072`
    *   **Background (Surface):** `#f9f9f9`
*   **Typography:** 
    *   **Headlines & Rankings:** `Newsreader` (Serif) for prestige and authority.
    *   **UI & Stats:** `Inter` (Sans) for modern functionalism and readability.
*   **Surface Hierarchy:**
    *   **Level 0 (Base):** `surface` (#f9f9f9)
    *   **Level 1 (Sections):** `surface_container_low` (#f3f3f3)
    *   **Level 2 (Cards):** `surface_container_lowest` (#ffffff)
*   **The "No-Line" Rule:** Sectioning is achieved through tonal background shifts rather than 1px solid borders.

### 2. Components
*   **Navigation:** Glassmorphism with `backdrop-blur-md` and 80% opacity Wimbledon White.
*   **Ranking Engine:** Editorial layout with alternating row colors and the "Wimbledon Stripe" for top seeds.
*   **Stats Cards:** Floating L2 cards on L1 containers, utilizing intentional asymmetry and luxury white space.

### 3. Data Flow
*   The system utilizes a **Delta logic** approach via Supabase RPC to track historical changes and performance trends over time.

---

## 📍 Project Phases

### Phase 1: The Foundation (Completed)
*   [x] Database Schema Design (Delta Tables).
*   [x] Automated Scraper (Singles & Doubles).
*   [x] **DINK Design System Migration:** Initial OKLCH transition.
*   [x] **Core Rankings:** Real-time dashboard for singles and doubles.

### Phase 2: The Grand Slam Editorial (Completed)
*   [x] **New Typography:** Transition to Inter and Newsreader.
*   [x] **Editorial Palette:** Adoption of Court Green and Wimbledon White.
*   [x] **Surface Hierarchy:** Implementation of the 3-level surface layering.
*   [x] **Component Refactor:** Complete overhaul of rankings, profiles, and activity feeds.

### Phase 3: Engagement (Current)
*   [ ] **Community Alerts:** Integration of WhatsApp/Telegram notification bridges.
*   [ ] **Feature Roadmap:** Implementing top-requested community tools.
*   [ ] **Authentication:** Evaluating Clerk vs. Supabase for player-owned profiles.

---

## 🚀 Technical Mandates for Gemini CLI
1.  **Git Workflow:**
    *   **Development:** All work happens on the `staging` branch (or feature branches from staging).
    *   **Commits:** Commit changes frequently as requested.
    *   **Production/Main:** Never merge into `main` until explicitly asked.
2.  **Editorial Preservation:** Strictly adhere to **The Grand Slam Editorial** design system. Use the tension between Serif and Sans typography to maintain the prestigious aesthetic.
3.  **Surgical Changes:** Keep all modifications as simple and focused as possible.
4.  **No-Line Rule:** Avoid 1px borders; use background color shifts for separation.
5.  **Documentation:** Maintain this file and the design system guide as the project evolves.
6.  **Verification:** Always run `npm run dev` to verify visual changes across breakpoints before finality.
