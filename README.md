# CAYMANDINK — Cayman Islands Pickleball Rankings

Cayman Islands pickleball rankings with every rating change recorded daily, live at [caymandink.com](https://caymandink.com) (formerly dinkdash.xyz).

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
Next.js 15 app in web/ → Cloudflare Workers (OpenNext)
```

Rankings history is stored as versioned rows (SCD-2 style): each scrape that changes a
player's rating/rank inserts a new row with `valid_from`, and `is_current` marks the
latest. The delta logic lives in the `upsert_ranking_delta_bulk` Postgres function in
Supabase (not yet committed to this repo).

## Repo layout

- `web/` — Next.js 15 (App Router) frontend. Server-rendered rankings + player pages with hourly ISR, seeded client context for interactivity.
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

The web app deploys to **Cloudflare Workers** via [OpenNext](https://opennext.js.org/cloudflare)
(config: `web/wrangler.jsonc`, `web/open-next.config.ts`). `prebuild` stamps `public/version.json`,
which the client polls to show the "New board live" prompt.

One-time setup (Cloudflare account that owns caymandink.com):

```bash
cd web
npx wrangler login
npx wrangler r2 bucket create caymandink-cache        # ISR cache (NEXT_INC_CACHE_R2_BUCKET)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY      # used by the suggest-feature server action
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are inlined at build time from
`web/.env.local` (or CI secrets). Then:

```bash
npm run preview   # build + run the Worker locally in workerd
npm run deploy    # build + deploy to Cloudflare
```

Attach `caymandink.com` to the Worker under Workers → caymandink → Domains & Routes (or uncomment
`routes` in `wrangler.jsonc`). Keep `dinkdash.xyz` redirecting to the new domain with a Cloudflare
Bulk Redirect (301, preserve path) so WhatsApp links and search results keep working.

## Design

See [web/DESIGN.md](web/DESIGN.md) for the "Grand Slam Editorial" design system
(court green + Volt Green accent, no-border surfaces, Newsreader display italics).
