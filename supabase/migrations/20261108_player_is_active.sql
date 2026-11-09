-- Track which players are currently listed on pickleball.ky.
--
-- The source removes players and sometimes adds them back. Their rows stay here so
-- history is never lost; is_active only controls whether the current row is shown
-- on the rankings board. The scraper payload is unchanged: each scrape is the full
-- source list, so anyone missing from it is hidden and anyone in it is shown.

ALTER TABLE pickleball_ratings.doubles_ratings_deltas
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE pickleball_ratings.singles_ratings_deltas
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION pickleball_ratings.upsert_ranking_delta_bulk(p_rows jsonb, p_table_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
   row_data RECORD;
   v_player_name TEXT;
   v_rank_position INT;
   v_rating NUMERIC;
   v_rounds_played INT;
   v_current_id INT;
   v_current_rating NUMERIC;
   v_current_rounds INT;
   v_active_before INT;
   v_scraped_count INT;
   v_scraped_names TEXT[];
BEGIN
   SELECT array_agg(DISTINCT x.player_name)
   INTO v_scraped_names
   FROM jsonb_to_recordset(p_rows) AS x(player_name text);

   v_scraped_count := coalesce(array_length(v_scraped_names, 1), 0);

   EXECUTE format('SELECT count(*) FROM pickleball_ratings.%I WHERE is_current = true AND is_active = true', p_table_name)
   INTO v_active_before;

   -- A broken or truncated scrape must not hide most of the board. Raising rolls
   -- back the whole call and returns an error, which triggers the scraper's alert.
   IF v_scraped_count = 0 OR v_scraped_count < v_active_before * 0.4 THEN
     RAISE EXCEPTION 'Refusing to sync %: scrape has % players but % are active', p_table_name, v_scraped_count, v_active_before;
   END IF;

   FOR row_data IN SELECT * FROM jsonb_to_recordset(p_rows) AS x(player_name text, rank_position int, rating numeric, rounds_played int)
   LOOP
     v_player_name := row_data.player_name;
     v_rank_position := row_data.rank_position;
     v_rating := row_data.rating;
     v_rounds_played := row_data.rounds_played;

     -- Get current record
     EXECUTE format('SELECT id, rating, rounds_played FROM pickleball_ratings.%I WHERE player_name = %L AND is_current = true LIMIT 1', p_table_name, v_player_name)
     INTO v_current_id, v_current_rating, v_current_rounds;

     IF v_current_id IS NOT NULL THEN
       -- IF RATING AND ROUNDS ARE SAME: Update the rank position on the current row (and restore the player if they were hidden)
       IF v_current_rating = v_rating AND v_current_rounds = v_rounds_played THEN
         EXECUTE format('UPDATE pickleball_ratings.%I SET rank_position = %L, is_active = true WHERE id = %L', p_table_name, v_rank_position, v_current_id);
       ELSE
         -- MEANINGFUL CHANGE: Standard delta logic (archive old, insert new)
         EXECUTE format('UPDATE pickleball_ratings.%I SET is_current = false, valid_to = now() WHERE id = %L', p_table_name, v_current_id);

         EXECUTE format('INSERT INTO pickleball_ratings.%I (player_name, rank_position, rating, rounds_played, is_current, is_active, valid_from)
                         VALUES (%L, %L, %L, %L, true, true, now())', p_table_name, v_player_name, v_rank_position, v_rating, v_rounds_played);
       END IF;
     ELSE
       -- NEW PLAYER: Just insert
       EXECUTE format('INSERT INTO pickleball_ratings.%I (player_name, rank_position, rating, rounds_played, is_current, is_active, valid_from)
                       VALUES (%L, %L, %L, %L, true, true, now())', p_table_name, v_player_name, v_rank_position, v_rating, v_rounds_played);
     END IF;
   END LOOP;

   -- Anyone not in this scrape is no longer listed at the source: hide, never delete.
   EXECUTE format('UPDATE pickleball_ratings.%I SET is_active = false WHERE is_current = true AND is_active = true AND player_name <> ALL ($1)', p_table_name)
   USING v_scraped_names;
END;
$$;
