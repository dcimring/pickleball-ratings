# Deep Linking & Routing Architecture Plan

## 1. Goal
Transition DinkDash from a Single Page Application (SPA) state-based view to a multi-page routed application using Next.js App Router. This enables deep linking, browser history support, and better shareability.

## 2. URL Schema
| Page | URL Path | Parameters |
| :--- | :--- | :--- |
| **Rankings** | `/` | `?tab=doubles\|singles` |
| **Activity** | `/activity` | `?tab=doubles\|singles`, `?sort=latest\|movers` |
| **Player Profile** | `/player/[slug]` | `?tab=doubles\|singles` |
| **Tourney Check** | `/tourney` | - |
| **Suggest Feature** | `/suggest` | - |
| **Alerts (WhatsApp)** | `/alerts` | - |

## 3. Pretty URLs (Slug Management)
To avoid messy `%20` characters in URLs for player names, we will implement **Hyphenated Slugs**.

*   **Format:** `michael-carse` instead of `Michael%20Carse`.
*   **Transformation Logic:**
    *   **Outgoing:** `name.toLowerCase().replace(/ /g, '-')`
    *   **Incoming (Resolution):** Since player names are currently our unique keys, we will query the database using a case-insensitive match where hyphens are treated as spaces.
    *   *Example:* `/player/michael-carse` -> Query: `SELECT * FROM ... WHERE player_name ILIKE 'Michael Carse'`

## 4. Architectural Refactor
Currently, `page.tsx` contains all logic. We will modularize as follows:

### Layout Logic
*   **`src/app/layout.tsx`**: Host the shared Navigation bar and Viewport settings to prevent re-renders during navigation.

### New Route Structure
*   `src/app/page.tsx` (Rankings)
*   `src/app/activity/page.tsx`
*   `src/app/tourney/page.tsx`
*   `src/app/suggest/page.tsx`
*   `src/app/alerts/page.tsx`
*   `src/app/player/[slug]/page.tsx` (Dynamic Route)

### Shared Components (`src/components/`)
*   `Navigation.tsx`
*   `RankingTable.tsx`
*   `ActivityFeed.tsx`
*   `PerformanceChart.tsx` (Extracted Recharts logic)
*   `StatCard.tsx`

## 5. Technical Implementation Steps
1.  **Extract Components:** Break down the 1,100+ line `page.tsx` into logical, reusable components in `src/components`.
2.  **Setup Folders:** Create the Next.js directory structure for all routes.
3.  **URL State Migration:** Replace `activeTab` and `activeView` state with `useSearchParams()` and `useParams()`.
4.  **Navigation Update:** Replace `button onClick={setActiveView}` with Next.js `<Link>` components.
5.  **Data Fetching:** Update each page to fetch its own required data (leveraging Next.js server components where possible for speed, or maintaining client-side fetching for real-time feel).
