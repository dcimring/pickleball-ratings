# Brainstorm: Growth & Engagement Strategy — Cayman Pickleball Ratings

**Date:** 2026-08-08
**Status:** Living document — updated as the session progresses

## Context (starting point)

- Current site: **dinkDash.xyz** — considering rebrand; top domain contender is **caymandink.com** (better SEO + branding).
- Medium/long-term project to capitalise on pickleball's popularity in Cayman.
- Monetisation thesis: land a **corporate sponsor** once the site has traction.
- Daniel built the **Corporate League leaderboard** for Pickleball Cayman:
  - Embedded via iframe at pickleball.ky/corporate-league/leaderboard/
  - Standalone at corpleague.xyz/leaderboard
  - The annual corporate league is extremely popular; participating corporates are the natural sponsor pipeline.
- **SEO thesis:** player profile pages are indexable — every player searching their own name is an entry point.
- **Core problem:** need a hook that gives players a reason to return regularly.

## Ideas on the table (from Daniel)

1. **Ranking-change alerts** — rankings are popular with a core group; notify them when their rank moves.
2. **Game scheduling** — help players organise games.
3. **Community features** — pickleball.ky is static with no community features; gap to fill.

## Discussion log

**Round 1 — sizing up the three ideas**
- Claude's position: the three ideas are three different jobs. Alerts = retention (strong, leverages unique data). Scheduling = fighting WhatsApp, likely a dead end in a community this small. Community features = cold-start risk; an empty forum is worse than none.
- Reframe proposed: don't fight WhatsApp, **feed it** — shareable moments (rank-change cards, movers lists) that players paste into their groups. This merges the retention hook and the SEO/acquisition loop into one flywheel.
- Domain: "dink" is insider vocabulary nobody searches. Real queries are "cayman pickleball rankings" / "pickleball cayman". Check `caymanpickleball.com` availability before committing to caymandink.com.

**Round 2 — the data moat surfaces**
- Daniel scrapes pickleball.ky daily. Crucially, pickleball.ky only keeps *latest* ratings — **Daniel has been storing rating changes over time. Nobody else has this data, including pickleball.ky.**
- Confirmed: Cayman pickleball coordination runs on WhatsApp groups, and Daniel is in many of them.

## Findings

- **The historical ratings dataset is the moat.** Latest ratings are a commodity (pickleball.ky has them); rating *trajectories* are unique and compound daily. Every product decision should exploit this.
- Data freshness ceiling: pickleball.ky updates at most once/day → daily scrape is sufficient; hooks should be weekly-cadence, not real-time.
- Distribution channel is already known: WhatsApp groups. Daniel has insider access for seeding.
- **Domain check (2026-08-08, whois):** `caymanpickleball.com` and `pickleballcayman.com` are TAKEN — registered the same minute (2023-01-10, GoDaddy), so one owner, almost certainly Pickleball Cayman. Available: `caymandink.com`, `dinkcayman.com`, `caymanpickleballrankings.com`.

**Round 3 — partner vs. independent**
- Claude laid out Game A (formalize with pickleball.ky as official stats partner) vs. Game B (build independently, negotiate later from strength). Flagged the core risk: the moat sits on a scraper pointed at someone else's site, and Daniel is simultaneously their vendor and a quasi-competitor.
- Daniel: leaning **B**. Good relationship with the owner, doesn't expect a cutoff; worst case he pitches the benefit ("excitement about rankings grows pickleball.ky too"). Owner is old-school and slow to innovate — better to build first, show a working thing, approach later.

**Round 4 — site audit (Claude browsed dinkdash.xyz, 2026-08-08)**
- Already built: Rankings (doubles/singles, search), **Activity feed** (weekly movers — historical data already in use), **Alerts page with a WhatsApp channel + QR signup**, Tourney Check, Suggest Feature, player profiles with Share Profile button and good SEO title tags ("Michael Carse | 5.841 Rating | DinkDash"). Server rendering was recently added (git log). Design is polished — green/cream, serif display type.
- Dataset size: **~524 rated doubles players** (50 shown + "474 more athletes remaining").
- ~~Gap 1: moat invisible~~ **Corrected in Round 5:** the trend chart works fine for active players (Caleb Sunkur shows a clean Feb→Jun trajectory + Recent Activity table with deltas). The #1 player simply hasn't played a rated game since data collection began. Real issue = **empty state**: inactive players see an apology ("pending more data") instead of a story ("4.800 · held since 13 Jun"). Copy/design fix, not a build.
- Gap 2: Share Profile likely shares a URL, not an image card. The WhatsApp-native share moment (rank card image / rich OG link preview) doesn't exist yet.
- Gap 3 (**confirmed in Round 5**): the WhatsApp channel was an idea Daniel grew cold on — never used, zero members. The Alerts page currently advertises a dead channel.

## Decisions

- **D1 (2026-08-08): Go Game B — build independently first, approach pickleball.ky later with a working product.** Rationale: owner is slow to innovate; a live product with traction is a better pitch than a proposal. Relationship is strong enough that cutoff risk is low. Mitigations required — see below.
- **D2 (2026-08-08, direction): The hook = "your story over time," weekly cadence, WhatsApp-native distribution.** Trajectory-rich profile pages + weekly Movers digest + shareable rank cards. Scheduling and community features deferred.
- **D3 (2026-08-08, recommended): Domain = caymandink.com.** Exact-match names are held by the incumbent; EMD is a minor SEO factor anyway. caymandink is short, brandable, WhatsApp-sayable. Win search via page titles/content on trajectory pages. Register promptly.
- **Game B mitigations (agreed as conditions of D1):** (1) scraper resilience + anomaly alerts so daily snapshots never gap; (2) stay additive, not substitutive — build what pickleball.ky doesn't do, don't mirror their ratings table; (3) keep a one-page Game A pitch ready ("here's the traffic and the WhatsApp sharing — embed it, official stats partner") for the eventual reveal.

**Round 5 — corrections & channel strategy**
- Trend chart confirmed working (see corrected Gap 1). WhatsApp channel confirmed dead (zero members, never used).
- Claude's position: skip the channel for now — it has a cold-start problem while Daniel already has warm distribution (the groups he's in). Post the weekly digest link into existing groups manually for the first months. Resurrect the channel only when demand pulls for it. Repoint the Alerts page away from the dead channel meanwhile.

## Session summary

**Strongest direction:** one flywheel — *trajectory-rich profile pages (SEO + vanity landing) → weekly Movers digest seeded into existing WhatsApp groups (habit + reach) → rich share moments via dynamic OG images (every pasted link becomes an ad).* No new surfaces needed; the site skeleton already exists. Scheduling and community features stay deferred.

**Prioritized next build steps (no new features, three amplifiers):**
1. **Dynamic OG images per player profile** — name, rating, rank, mini trend chart, server-rendered. Highest leverage: makes every WhatsApp-pasted link a rank card for free.
2. **Weekly Movers digest ritual** — same day every week; top climbers, milestones, link to Activity page. Daniel posts it into existing groups manually. The Activity page already computes the content; it needs serializing into a post format.
3. **Profile empty-state fix** — inactive players get "held at X since <date>" instead of "pending more data".
4. **Register caymandink.com** promptly and migrate.

**Riskiest assumption:** that pickleball.ky tolerates the scraping once the site is visibly popular (Game B bet). Mitigated by staying additive, keeping the relationship warm, and having the Game A partner pitch ready.

**Sponsor metric to instrument from day one:** weekly active *rated players* / total rated players (~524 doubles), plus UTM-tagged share links as a WhatsApp-forward proxy. Sponsors buy penetration and habit in an affluent niche, not raw traffic.

**Parked ideas (revisit later):**
- WhatsApp channel (resurrect on demand-pull)
- Community features (after traffic exists)
- Game scheduling (probably never — WhatsApp owns it)
- Corporate league cross-promotion (seasonal opportunity: corp league players landing on year-round profiles)

## Prototype: OG image upgrade (built 2026-08-08)

- Discovered a per-player OG image already existed (`web/src/app/player/[slug]/opengraph-image.tsx`, next/og on edge runtime) showing name, rating, rank — live and working.
- Upgraded it to show **movement + the moat**: rating delta chip (▲/▼ vs. previous snapshot), rank movement chip, and a **rating-trend sparkline** (last 20 snapshots, area fill + end dot) with "Trend · Since <first snapshot>" caption. Data comes from the existing `getPlayerHistory()` in `rankings-api.ts` — no new queries or schema.
- Implementation notes: the bundled OG font has no ▲/▼ glyphs and satori doesn't support CSS border-triangles — arrows are inline SVG paths. Doubles preferred, singles fallback.
- Verified locally on three cases: rising player (Caleb Sunkur — lime chips + climbing sparkline), single-snapshot player (Michael Carse — degrades to the original clean layout, no chips/chart), declining player with a long two-line name (Alexander McLaughlin — red chips, declining sparkline, layout holds).
- `tsc --noEmit` and ESLint pass. Not yet committed/deployed.

## Open questions

- What's actually behind "Tourney Check"? (not explored this session)
- Singles rankings have very low round counts (Caleb: #3 with 3 rounds) — does singles need a minimum-rounds threshold to be credible?
- When the reveal conversation with the pickleball.ky owner happens, what's the ask — embed, link-out as official stats partner, or just blessing?
- Backfill: are there any older snapshots (pre-Feb 2026) anywhere that could extend history?
