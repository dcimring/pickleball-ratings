# Dynamic Link Previews & OG Image Plan

This plan outlines the implementation of dynamic metadata and custom Open Graph (OG) images for DinkDash, ensuring that shared links (e.g., on WhatsApp, X, or iMessage) provide rich, player-specific information.

## 1. Dynamic Metadata (`generateMetadata`)
We will move away from static metadata in `layout.tsx` for player-specific routes and use Next.js's server-side `generateMetadata` function.

- **Location:** `web/src/app/player/[slug]/page.tsx`
- **Logic:**
  1. Extract the `slug` from params.
  2. Unslugify to get the player's name.
  3. Perform a server-side fetch to Supabase to get the latest rating and rank.
  4. Return a `Metadata` object with:
     - `title`: `[Player Name] | [Rating] Doubles | DinkDash`
     - `description`: `Check out [Player Name]'s latest pickleball rankings and performance trends on the Cayman Islands data platform.`

## 2. Dynamic OG Images (`opengraph-image.tsx`)
We will use the Next.js specialized `opengraph-image` file convention to generate real-time PNG images for each player.

- **Location:** `web/src/app/player/[slug]/opengraph-image.tsx`
- **Runtime:** Vercel Edge Runtime (via `next/og`).
- **Design Elements:**
  - **Background:** Dark slate with a subtle "DinkDash" watermark.
  - **Typography:** Use the `Orbitron` font for the player's name and rating.
  - **Data:** Display the current rating, rank position, and a "Cayman Islands" badge.
  - **Colors:** High-contrast "Volt" yellow for key stats.

## 3. Implementation Steps
1. **Shared Data Utility:** Create `web/src/lib/metadata-api.ts` to provide a unified way to fetch player stats on the server.
2. **Metadata Integration:** Update the player profile page to use `generateMetadata`.
3. **OG Image Component:** Build the JSX-to-PNG template using `ImageResponse`.
4. **Caching:** Ensure Vercel's Edge Network correctly caches these images to prevent redundant database hits.
5. **Global Fallbacks:** Ensure the root `layout.tsx` still handles generic pages gracefully.
