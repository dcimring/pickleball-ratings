# CLAUDE.md

## Git workflow

- **Work directly on `main`.** Daniel is the only person working on this repo — no feature branches, no PRs, no staging branch required (decided 2026-08-08). Commit and push to `main`.
- The old `staging` and `feature/blue-mode` branches are historical; don't base new work on them.

## Project overview

Cayman Islands pickleball ratings site, live at dinkdash.xyz (planned migration to caymandink.com).

- `web/` — Next.js app (App Router), data from Supabase (`pickleball_ratings` schema).
- `scraper.gs` — Google Apps Script that scrapes pickleball.ky daily. The moat is the *history*: pickleball.ky only keeps latest ratings; this project stores every change (`singles_ratings_deltas` / `doubles_ratings_deltas`, snapshot rows with `valid_from` / `is_current`).
- `supabase/` — schema dump.
- `docs/` — strategy and brainstorm docs. See `docs/brainstorm-2026-08-08-growth-strategy.md` for the growth strategy, decisions, and roadmap priorities.

## Conventions

- Server-side data access goes through `web/src/lib/rankings-api.ts` and `web/src/lib/metadata-api.ts` (React `cache()`-wrapped Supabase queries).
- Brand colors come from `web/src/lib/brand-config.ts` — don't hardcode hexes in components.
- Run `npx tsc --noEmit` and `npm run lint` in `web/` before committing.
