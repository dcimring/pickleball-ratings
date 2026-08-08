# Supabase schema

`schema.sql` is a schema-only dump of the `pickleball_ratings` schema — tables,
sequences, the `upsert_ranking_delta_bulk` RPC (used by the scraper), RLS policies,
and grants. It exists so the backend is reproducible and reviewable from git.

This is a snapshot, not a migration system: if you change the database in the
Supabase dashboard, re-dump and commit.

## Re-dumping

Requires `SUPABASE_DB_URL` in the root `.env` (the direct connection string) and
Homebrew `libpq`. The direct host is IPv6-only, so the dump goes through the
session pooler (project region: us-west-2):

```bash
PASS=$(grep '^SUPABASE_DB_URL=' .env | cut -d= -f2- | sed -E 's|postgresql://postgres:(.*)@db\..*|\1|')
/opt/homebrew/opt/libpq/bin/pg_dump \
  "postgresql://postgres.jdichflvfjnabzzdctxv:${PASS}@aws-0-us-west-2.pooler.supabase.com:5432/postgres" \
  --schema-only --schema=pickleball_ratings --no-owner -f supabase/schema.sql
```

Then remove any `\restrict`/`\unrestrict` lines pg_dump 18+ adds:

```bash
sed -i '' '/^\\restrict /d; /^\\unrestrict /d' supabase/schema.sql
```

## Notes

- `upsert_ranking_delta` (singular) is a legacy per-row function superseded by
  `upsert_ranking_delta_bulk`; it's kept in the dump because it still exists in
  the database. Safe to drop from the DB if nothing else calls it.
- `feature_requests` has RLS enabled with no read policy, so the anon `GRANT SELECT`
  on it is inert — reads only work via the service role.
