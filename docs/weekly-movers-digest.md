# Weekly Movers digest — format & template

The weekly WhatsApp post that anchors the retention loop (see
[brainstorm-2026-08-08-growth-strategy.md](brainstorm-2026-08-08-growth-strategy.md)).
Daniel posts it manually into existing WhatsApp groups, same day every week.

## Rules of the format

- **Three names max**: biggest rating gain, biggest rank jump, and a milestone.
  The full list is the click-through — don't reproduce it in the message.
- **Always scan for threshold crossings** (3.0 / 3.5 / 4.0 / 4.5 / 5.0). A
  milestone line is the most-forwarded line in the post — it beats any delta.
- **Fixed posting day.** Friday morning: the daily scrape has caught midweek
  league play and people have weekend games to talk about. The ritual (same
  day, every week) is the retention mechanic — don't drift.
- **Voice**: Daniel's — plain, direct, no hype, no emoji spam. The last line
  states the moat ("tracking every rating change since February") without
  selling.
- **Link**: always write the full `https://dinkdash.xyz/weekly` in the message
  — WhatsApp only reliably generates the preview card when the URL includes
  the scheme; a bare `dinkdash.xyz/weekly` can render as plain text (found
  2026-08-08). `/weekly` is a clean short link that forwards to
  the Activity page with UTM parameters attached, so WhatsApp shares are
  measurable without ugly URLs in the message. `/weekly` is a real page (not a
  bare 30x — preview crawlers don't follow those) that serves a **dynamic
  digest OG card** (`web/src/app/weekly/opengraph-image.tsx`: players moved,
  biggest climb, milestone crossing — computed live from `getWeeklyMovers()`)
  and instantly redirects human visitors. The preview card regenerates itself,
  so the pasted message gets a current headline graphic with zero manual work.

## Template

Replace the bracketed values from the Activity page (`/activity`, "This Week"
section) each Friday:

```
*Cayman Pickleball Movers — week of [DATE]*

[N] players moved in the rankings this week.

Biggest climb: [NAME], +[RATING DELTA] and up [X] spots to #[RANK].

[NAME 2] +[DELTA], up [X] places to #[RANK].

[MILESTONE NAME] crossed [THRESHOLD] — now [RATING], up [X] to #[RANK].

Full list plus every player's rating history is at https://dinkdash.xyz/weekly — search your name to see your own trend.

I've been tracking every rating change on the island since February, so the charts get more interesting every week.
```

If there's no milestone that week, drop the milestone line — don't force one.
If a week is genuinely quiet (few movers), lead with the quiet ("a quiet week —
only [N] players moved") rather than skipping the post; the ritual matters more
than the content.

## First issue (drafted 2026-08-08)

*Cayman Pickleball Movers — week of 8 Aug*

24 players moved in the rankings this week.

Biggest climb: John Mitchell, +0.139 and up 25 spots to #91.

Ankit Gupta +0.103, up 23 places to #160.

Louie Pullen crossed 4.0 — now 4.030, up 14 to #57.

Full list plus every player's rating history is at https://dinkdash.xyz/weekly — search your name to see your own trend.

I've been tracking every rating change on the island since February, so the charts get more interesting every week.
