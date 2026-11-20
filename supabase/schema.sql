--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pickleball_ratings; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pickleball_ratings;


--
-- Name: upsert_ranking_delta_bulk(jsonb, text); Type: FUNCTION; Schema: pickleball_ratings; Owner: -
--

CREATE FUNCTION pickleball_ratings.upsert_ranking_delta_bulk(p_rows jsonb, p_table_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
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
$_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: doubles_ratings_deltas; Type: TABLE; Schema: pickleball_ratings; Owner: -
--

CREATE TABLE pickleball_ratings.doubles_ratings_deltas (
    id integer NOT NULL,
    player_name text NOT NULL,
    rank_position integer NOT NULL,
    rating numeric(5,3),
    valid_from date NOT NULL,
    valid_to date,
    is_current boolean DEFAULT true,
    rounds_played integer,
    is_active boolean DEFAULT true NOT NULL,
    source_player_id integer
);


--
-- Name: doubles_ratings_deltas_id_seq; Type: SEQUENCE; Schema: pickleball_ratings; Owner: -
--

CREATE SEQUENCE pickleball_ratings.doubles_ratings_deltas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doubles_ratings_deltas_id_seq; Type: SEQUENCE OWNED BY; Schema: pickleball_ratings; Owner: -
--

ALTER SEQUENCE pickleball_ratings.doubles_ratings_deltas_id_seq OWNED BY pickleball_ratings.doubles_ratings_deltas.id;


--
-- Name: feature_requests; Type: TABLE; Schema: pickleball_ratings; Owner: -
--

CREATE TABLE pickleball_ratings.feature_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_name text NOT NULL,
    details text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: singles_ratings_deltas; Type: TABLE; Schema: pickleball_ratings; Owner: -
--

CREATE TABLE pickleball_ratings.singles_ratings_deltas (
    id integer NOT NULL,
    player_name text NOT NULL,
    rank_position integer NOT NULL,
    rating numeric(5,3),
    valid_from date NOT NULL,
    valid_to date,
    is_current boolean DEFAULT true,
    rounds_played integer,
    is_active boolean DEFAULT true NOT NULL,
    source_player_id integer
);


--
-- Name: singles_ratings_deltas_id_seq; Type: SEQUENCE; Schema: pickleball_ratings; Owner: -
--

CREATE SEQUENCE pickleball_ratings.singles_ratings_deltas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: singles_ratings_deltas_id_seq; Type: SEQUENCE OWNED BY; Schema: pickleball_ratings; Owner: -
--

ALTER SEQUENCE pickleball_ratings.singles_ratings_deltas_id_seq OWNED BY pickleball_ratings.singles_ratings_deltas.id;


--
-- Name: doubles_ratings_deltas id; Type: DEFAULT; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE ONLY pickleball_ratings.doubles_ratings_deltas ALTER COLUMN id SET DEFAULT nextval('pickleball_ratings.doubles_ratings_deltas_id_seq'::regclass);


--
-- Name: singles_ratings_deltas id; Type: DEFAULT; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE ONLY pickleball_ratings.singles_ratings_deltas ALTER COLUMN id SET DEFAULT nextval('pickleball_ratings.singles_ratings_deltas_id_seq'::regclass);


--
-- Name: doubles_ratings_deltas doubles_ratings_deltas_pkey; Type: CONSTRAINT; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE ONLY pickleball_ratings.doubles_ratings_deltas
    ADD CONSTRAINT doubles_ratings_deltas_pkey PRIMARY KEY (id);


--
-- Name: feature_requests feature_requests_pkey; Type: CONSTRAINT; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE ONLY pickleball_ratings.feature_requests
    ADD CONSTRAINT feature_requests_pkey PRIMARY KEY (id);


--
-- Name: singles_ratings_deltas singles_ratings_deltas_pkey; Type: CONSTRAINT; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE ONLY pickleball_ratings.singles_ratings_deltas
    ADD CONSTRAINT singles_ratings_deltas_pkey PRIMARY KEY (id);


--
-- Name: doubles_ratings_deltas_source_player_id_idx; Type: INDEX; Schema: pickleball_ratings; Owner: -
--

CREATE INDEX doubles_ratings_deltas_source_player_id_idx ON pickleball_ratings.doubles_ratings_deltas USING btree (source_player_id) WHERE is_current;


--
-- Name: singles_ratings_deltas_source_player_id_idx; Type: INDEX; Schema: pickleball_ratings; Owner: -
--

CREATE INDEX singles_ratings_deltas_source_player_id_idx ON pickleball_ratings.singles_ratings_deltas USING btree (source_player_id) WHERE is_current;


--
-- Name: doubles_ratings_deltas Allow public read access; Type: POLICY; Schema: pickleball_ratings; Owner: -
--

CREATE POLICY "Allow public read access" ON pickleball_ratings.doubles_ratings_deltas FOR SELECT TO authenticated, anon USING (true);


--
-- Name: singles_ratings_deltas Allow public read access; Type: POLICY; Schema: pickleball_ratings; Owner: -
--

CREATE POLICY "Allow public read access" ON pickleball_ratings.singles_ratings_deltas FOR SELECT TO authenticated, anon USING (true);


--
-- Name: doubles_ratings_deltas; Type: ROW SECURITY; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE pickleball_ratings.doubles_ratings_deltas ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_requests; Type: ROW SECURITY; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE pickleball_ratings.feature_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: singles_ratings_deltas; Type: ROW SECURITY; Schema: pickleball_ratings; Owner: -
--

ALTER TABLE pickleball_ratings.singles_ratings_deltas ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA pickleball_ratings; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA pickleball_ratings TO anon;
GRANT USAGE ON SCHEMA pickleball_ratings TO authenticated;
GRANT USAGE ON SCHEMA pickleball_ratings TO service_role;


--
-- Name: FUNCTION upsert_ranking_delta_bulk(p_rows jsonb, p_table_name text); Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT ALL ON FUNCTION pickleball_ratings.upsert_ranking_delta_bulk(p_rows jsonb, p_table_name text) TO service_role;


--
-- Name: TABLE doubles_ratings_deltas; Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT SELECT ON TABLE pickleball_ratings.doubles_ratings_deltas TO anon;
GRANT SELECT ON TABLE pickleball_ratings.doubles_ratings_deltas TO authenticated;
GRANT ALL ON TABLE pickleball_ratings.doubles_ratings_deltas TO service_role;


--
-- Name: SEQUENCE doubles_ratings_deltas_id_seq; Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT ALL ON SEQUENCE pickleball_ratings.doubles_ratings_deltas_id_seq TO service_role;


--
-- Name: TABLE feature_requests; Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT SELECT ON TABLE pickleball_ratings.feature_requests TO anon;
GRANT SELECT ON TABLE pickleball_ratings.feature_requests TO authenticated;
GRANT ALL ON TABLE pickleball_ratings.feature_requests TO service_role;


--
-- Name: TABLE singles_ratings_deltas; Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT SELECT ON TABLE pickleball_ratings.singles_ratings_deltas TO anon;
GRANT SELECT ON TABLE pickleball_ratings.singles_ratings_deltas TO authenticated;
GRANT ALL ON TABLE pickleball_ratings.singles_ratings_deltas TO service_role;


--
-- Name: SEQUENCE singles_ratings_deltas_id_seq; Type: ACL; Schema: pickleball_ratings; Owner: -
--

GRANT ALL ON SEQUENCE pickleball_ratings.singles_ratings_deltas_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: pickleball_ratings; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA pickleball_ratings GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: pickleball_ratings; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA pickleball_ratings GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: pickleball_ratings; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA pickleball_ratings GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA pickleball_ratings GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA pickleball_ratings GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


