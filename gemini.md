# 🎯 Project Vision: DinkDash.xyz

A comprehensive, **fully responsive** data platform for Cayman Islands pickleball players. The hub provides performance history, real-time rank tracking, and community features, optimized for use on the court (mobile) or at home (desktop).

---

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router) with **Tailwind CSS**.
*   **Design System:** Custom **DINK Design System** (OKLCH color palette, Space Grotesk typography).
*   **Icons:** **Lucide React**.
*   **Animations:** **Framer Motion**.
*   **Database:** Supabase (PostgreSQL).
*   **Scraper:** Google Apps Script (GAS) using Delta Logic.
*   **Deployment:** Vercel.

---

## 📐 Architecture & Standards

### 1. Design System (DINK)
*   **Colors:** OKLCH-based theme defined in `globals.css` using semantic tokens.
    *   **Background (Primary Base):** `#144EC3` (Tonal Blue)
    *   **Secondary (Surface Accent):** `#1C5ED9` (Lighter Blue)
    *   **Foreground (Typography):** `#FDFFFC` (White)
    *   **Primary (Action Color):** `#238145` (Success Green)
*   **Typography:** 
    *   **All Text:** `Space Grotesk` (Geometric, modern, and tech-forward).
    *   **Headings:** Bold weight, `tracking-tighter`.
*   **Spacing & Radius:** Standardized `1rem` (`2xl`/`3xl`) border radius for an app-like feel.

### 2. Components
*   **Navigation:** Fixed `backdrop-blur-md` header with semantic navigation items.
*   **Ranking Engine:** Real-time filtering and sorting of player data via `RankingTable.tsx`.
*   **Mobile Experience:** Large tap targets, high-contrast UI, and sticky search bars for court-side use.

### 3. Data Flow
*   The system utilizes a **Delta logic** approach via Supabase RPC to track historical changes and performance trends over time.

---

## 📍 Project Phases

### Phase 1: The Foundation (Completed)
*   [x] Database Schema Design (Delta Tables).
*   [x] Automated Scraper (Singles & Doubles).
*   [x] **DINK Design System Migration:** Full transition to OKLCH and Space Grotesk.
*   [x] **Core Rankings:** Real-time dashboard for singles and doubles.
*   [x] **Activity Feed:** Historical tracking of rating changes.
*   [x] **Advanced Tools:** Tournament check and player profile deep-dives.

### Phase 2: Engagement (Current)
*   [ ] **Community Alerts:** Integration of WhatsApp/Telegram notification bridges.
*   [ ] **Feature Roadmap:** Implementing top-requested community tools.
*   [ ] **Authentication:** Evaluating Clerk vs. Supabase for player-owned profiles.

---

## 🚀 Technical Mandates for Gemini CLI
1.  **Git Workflow:**
    *   **Development:** All work happens on the `staging` branch.
    *   **Commits:** Commit changes to `staging` frequently as requested.
    *   **Production/Main:** Never merge `staging` into `main` or push `main` to GitHub until explicitly asked.
    *   **Deployment:** Merging into `main` and pushing to GitHub triggers the production deployment on Vercel.
2.  **Style Preservation:** Strictly adhere to the **DINK Design System** (`DESIGN_SYSTEM.md`). Use semantic Tailwind tokens (`primary`, `secondary`, etc.) rather than hardcoded hex values.
3.  **Surgical Changes:** Keep all modifications as simple and focused as possible.
4.  **Documentation:** Maintain this file and the design system guide as the project evolves.
5.  **Verification:** Always run `npm run dev` to verify visual changes across breakpoints before finality.
