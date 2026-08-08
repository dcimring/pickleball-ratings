# DinkDash — Cayman Islands Pickleball Rankings

Real-time rank tracking and analytics for the Cayman Islands pickleball community, live at [dinkdash.xyz](https://dinkdash.xyz).

## How it works

```
pickleball.ky (TablePress rankings pages)
        │  daily scrape ~1 AM (Google Apps Script)
        ▼
scraper.gs → Supabase RPC upsert_ranking_delta_bulk
        ▼
Supabase Postgres — schema `pickleball_ratings`
        ├─ singles_ratings_deltas   (versioned rows: valid_from + is_current)
        ├─ doubles_ratings_deltas
        └─ feature_requests
        ▼
Next.js 14 app in web/ → Vercel
```

Rankings history is stored as versioned rows (SCD-2 style): each scrape that changes a
player's rating/rank inserts a new row with `valid_from`, and `is_current` marks the
latest. The delta logic lives in the `upsert_ranking_delta_bulk` Postgres function in
Supabase (not yet committed to this repo).

## Repo layout

- `web/` — Next.js 14 (App Router) frontend. Server-rendered rankings + player pages with hourly ISR, seeded client context for interactivity.
- `scraper.gs` — Google Apps Script scraper. Deployed by pasting into [script.google.com](https://script.google.com); see the header comment for setup (script properties + daily trigger). Emails on scrape failure.
- `.github/workflows/ci.yml` — lint, typecheck, and build on PRs and pushes.

## Local development

```bash
cd web
cp .env.example .env.local   # fill in Supabase values
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

## Environment variables

See [web/.env.example](web/.env.example). The scraper needs `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` as Apps Script *Script Properties* (plus optional
`ALERT_EMAIL` for failure notifications).

## Deployment

The web app deploys to Vercel (project root: `web/`). Set the three env vars from
`.env.example` in Vercel. `prebuild` stamps `public/version.json`, which the client
polls to prompt users to refresh after a deploy.

## Design

See [web/DESIGN.md](web/DESIGN.md) for the "Grand Slam Editorial" design system
(court green + Volt Green accent, no-border surfaces, Newsreader display italics).
