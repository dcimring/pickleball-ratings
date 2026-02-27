## 🎯 Project Vision

A comprehensive, **fully responsive** data platform for Cayman Islands pickleball players. The hub provides performance history, real-time rank tracking, and community features, optimized for use on the court (mobile) or at home (desktop).

---

## 🛠 Tech Stack

* **Scraper:** Google Apps Script (GAS) using Delta Logic.
* **Database:** Supabase (PostgreSQL) — Project: "sites".
* **Schema:** `pickleball_ratings`.
* **Frontend:** Next.js with **Tailwind CSS**.
* **Style Guide:** Detailed in `web/STYLE_GUIDE.md`.
* **UI Components:** **shadcn/ui** (Radix UI + Lucide Icons).
* **Auth:** TBD (Evaluating **Clerk** vs. Supabase Auth).
* **Deployment:** Vercel.

---

## 📍 Phase 1: The Foundation (Current)

* [x] Database Schema Design (Delta Tables).
* [x] Supabase RPC for Delta logic.
* [x] Automated Scraper (Singles & Doubles).
* [x] **Mobile-First Dashboard:** Build the core ranking view using `shadcn/ui` tables and cards.
* [x] **Responsive Navigation:** Implement a mobile drawer/hamburger menu for easy navigation.

---

## 🚀 Future Feature Ideas

### 1. Mobile-Optimized Analytics

* **Court-Side View:** High-contrast, large-tap-target interface designed for quick checking between matches.
* **Performance Trends:** "Sparkline" charts in the main list to show 7-day trends at a glance.
* **Comparison Tool:** Select two players to see a side-by-side "Matchup" breakdown on mobile.

### 2. Alerts & Notifications

* **Push Notifications:** Use Web Push or IM (WhatsApp/Telegram) to alert users of rank changes.
* **Daily Digest:** A summary email of the biggest movers in the Cayman rankings.

### 3. Community & Logistics

* **Match Arranger:** Integrate with Clerk/Auth to allow players to set "Home Courts" and find partners.
* **Tournament Integration:** Pull in local Cayman tournament dates with "Add to Calendar" functionality.

