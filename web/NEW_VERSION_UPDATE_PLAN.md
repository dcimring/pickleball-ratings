# ⚡️ New Version Available Notification Plan

This document outlines the strategy for detecting and notifying users when a new version of the DinkDash application has been deployed.

## 1. Versioning Strategy
We need a consistent way to identify the current build on both the server and the client.

*   **Build ID:** We will use a unique identifier (like the Git Commit SHA or a build timestamp) generated during the build process.
*   **Version Endpoint:** A static `public/version.json` file will be generated at build time. This file will contain the current `buildId`.
    *   Example: `{"buildId": "202310271430"}`

## 2. Client-Side Monitoring
The app needs to periodically check if the server's version matches the version currently running in the user's browser.

*   **Initial Load:** When the app first mounts, it fetches `version.json` and stores the `initialBuildId` in memory (or a React state).
*   **Polling Logic:**
    *   **Interval:** Check every 10 minutes.
    *   **Tab Focus:** Re-check whenever the user refocuses the browser tab (`window.onfocus`).
*   **Detection:** If `fetchedBuildId !== initialBuildId`, an "Update Available" state is triggered.

## 3. User Interface (UI)
The notification should be high-contrast and aligned with the **DINK Design System**.

*   **Component:** A floating snackbar/toast positioned at the bottom-center of the viewport.
*   **Style:**
    *   **Background:** `bg-primary` (Vibrant Lime).
    *   **Text:** `text-primary-foreground` (Black) for maximum readability.
    *   **Typography:** `font-display font-bold text-xs tracking-widest`.
    *   **Animation:** Use `framer-motion` for a slide-up entry from the bottom.
*   **Message:** `⚡️ NEW VERSION AVAILABLE`
*   **Action:** A clear `[RELOAD]` button that triggers `window.location.reload(true)`.

## 4. Implementation Steps
1.  **Build Script:** Update `package.json` to generate `public/version.json` before the Next.js build.
2.  **Version Hook:** Create a `useVersionCheck` hook to handle the fetching and polling logic.
3.  **UI Component:** Build the `UpdatePrompt.tsx` component.
4.  **Integration:** Add the `UpdatePrompt` to the root `layout.tsx` so it persists across all pages.

## 5. Benefits
*   **Prevents Chunk Errors:** Next.js can throw errors if a user tries to navigate to a page whose JavaScript "chunk" was deleted during a new deployment. This prompt encourages users to refresh before that happens.
*   **Low Overhead:** Fetching a tiny JSON file every few minutes has zero impact on performance.
*   **Real-time Feel:** Reinforces the app's identity as a live, frequently updated dashboard.
