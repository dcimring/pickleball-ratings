-- Track pickleball.ky's own player id so a rename at the source doesn't split a
-- player's history.
--
-- The doubles feed (rankings.pickleball.ky/api/players) gives every player a stable
-- numeric id. Singles still comes from a TablePress page with no ids, so its
-- source_player_id stays null and it keeps matching by name.
--
-- Matching, per scraped row:
--   1. by source_player_id, if the row has one and a current row carries it;
--   2. otherwise by player_name. The first time a player arrives with an id it is
--      stamped onto all of their rows, so the backfill happens on the first scrape.
--      If the name already carries a different id (re-registered at the source),
--      the name still wins, since the web app can't show two players with one name,
--      and the newest id is stored on the current row from then on.
-- When matched by id, the existing player_name is kept: the web app keys player
-- pages and URLs on the name. The scraper reports such renames to Discord.
--
-- Backward compatible: a payload without source_player_id behaves as before.

ALTER TABLE pickleball_ratings.doubles_ratings_deltas
  ADD COLUMN IF NOT EXISTS source_player_id integer;

ALTER TABLE pickleball_ratings.singles_ratings_deltas
  ADD COLUMN IF NOT EXISTS source_player_id integer;

CREATE INDEX IF NOT EXISTS doubles_ratings_deltas_source_player_id_idx
  ON pickleball_ratings.doubles_ratings_deltas (source_player_id) WHERE is_current;

CREATE INDEX IF NOT EXISTS singles_ratings_deltas_source_player_id_idx
  ON pickleball_ratings.singles_ratings_deltas (source_player_id) WHERE is_current;

CREATE OR REPLACE FUNCTION pickleball_ratings.upsert_ranking_delta_bulk(p_rows jsonb, p_table_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
   row_data RECORD;
   v_player_name TEXT;
   v_current_id INT;
   v_current_name TEXT;
   v_current_rating NUMERIC;
   v_current_rounds INT;
   v_current_source_id INT;
   v_active_before INT;
   v_scraped_count INT;
   v_seen_names TEXT[] := ARRAY[]::TEXT[];
BEGIN
   SELECT count(DISTINCT x.player_name)
   INTO v_scraped_count
   FROM jsonb_to_recordset(p_rows) AS x(player_name text);

   EXECUTE format('SELECT count(*) FROM pickleball_ratings.%I WHERE is_current = true AND is_active = true', p_table_name)
   INTO v_active_before;

   -- A broken or truncated scrape must not hide most of the board. Raising rolls
   -- back the whole call and returns an error, which triggers the scraper's alert.
   IF v_scraped_count = 0 OR v_scraped_count < v_active_before * 0.4 THEN
     RAISE EXCEPTION 'Refusing to sync %: scrape has % players but % are active', p_table_name, v_scraped_count, v_active_before;
   END IF;

   FOR row_data IN SELECT * FROM jsonb_to_recordset(p_rows)
       AS x(player_name text, rank_position int, rating numeric, rounds_played int, source_player_id int)
   LOOP
     v_player_name := row_data.player_name;
     v_current_id := NULL;

     -- 1. Match on the source's id.
     IF row_data.source_player_id IS NOT NULL THEN
       EXECUTE format('SELECT id, player_name, rating, rounds_played, source_player_id FROM pickleball_ratings.%I
                       WHERE source_player_id = $1 AND is_current = true LIMIT 1', p_table_name)
       INTO v_current_id, v_current_name, v_current_rating, v_current_rounds, v_current_source_id
       USING row_data.source_player_id;
     END IF;

     -- 2. Fall back to the name.
     IF v_current_id IS NULL THEN
       EXECUTE format('SELECT id, player_name, rating, rounds_played, source_player_id FROM pickleball_ratings.%I
                       WHERE player_name = $1 AND is_current = true LIMIT 1', p_table_name)
       INTO v_current_id, v_current_name, v_current_rating, v_current_rounds, v_current_source_id
       USING v_player_name;

       -- First time this player arrives with an id: stamp it on their whole history.
       IF v_current_id IS NOT NULL AND v_current_source_id IS NULL AND row_data.source_player_id IS NOT NULL THEN
         EXECUTE format('UPDATE pickleball_ratings.%I SET source_player_id = $1 WHERE player_name = $2 AND source_player_id IS NULL', p_table_name)
         USING row_data.source_player_id, v_current_name;
       END IF;
     END IF;

     IF v_current_id IS NOT NULL THEN
       v_player_name := v_current_name; -- keep our name so history and URLs stay together

       IF v_current_rating = row_data.rating AND v_current_rounds = row_data.rounds_played THEN
         -- No change: refresh rank position (and restore the player if they were hidden).
         EXECUTE format('UPDATE pickleball_ratings.%I SET rank_position = $1, is_active = true,
                           source_player_id = coalesce($3, source_player_id) WHERE id = $2', p_table_name)
         USING row_data.rank_position, v_current_id, row_data.source_player_id;
       ELSE
         -- Meaningful change: archive old, insert new.
         EXECUTE format('UPDATE pickleball_ratings.%I SET is_current = false, valid_to = now() WHERE id = $1', p_table_name)
         USING v_current_id;

         EXECUTE format('INSERT INTO pickleball_ratings.%I (player_name, rank_position, rating, rounds_played, source_player_id, is_current, is_active, valid_from)
                         VALUES ($1, $2, $3, $4, $5, true, true, now())', p_table_name)
         USING v_player_name, row_data.rank_position, row_data.rating, row_data.rounds_played,
               coalesce(row_data.source_player_id, v_current_source_id);
       END IF;
     ELSE
       -- New player.
       EXECUTE format('INSERT INTO pickleball_ratings.%I (player_name, rank_position, rating, rounds_played, source_player_id, is_current, is_active, valid_from)
                       VALUES ($1, $2, $3, $4, $5, true, true, now())', p_table_name)
       USING v_player_name, row_data.rank_position, row_data.rating, row_data.rounds_played, row_data.source_player_id;
     END IF;

     v_seen_names := array_append(v_seen_names, v_player_name);
   END LOOP;

   -- Anyone not in this scrape is no longer listed at the source: hide, never delete.
   EXECUTE format('UPDATE pickleball_ratings.%I SET is_active = false WHERE is_current = true AND is_active = true AND player_name <> ALL ($1)', p_table_name)
   USING v_seen_names;
END;
$$;
