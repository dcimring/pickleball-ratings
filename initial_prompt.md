Act as an expert Full Stack Engineer. Build a Google Apps Script (GAS) to scrape pickleball rankings and store them in Supabase using a Delta strategy.

**URLs to Scrape:**
- Doubles: https://www.pickleball.ky/rankings/
- Singles: https://www.pickleball.ky/singles-rankings/

**Target:**
- Supabase Project: "sites"
- Schema: "pickleball_ratings"
- Database Function to call: `pickleball_ratings.upsert_ranking_delta`

**Requirements:**
1. **Scraper Script:** Write a GAS script that fetches both URLs. Use Regex or a robust string-parsing method to extract: Rank, Player Name, and Rating from the tables.
2. **Supabase Integration:** For every player found, the script should call the Supabase RPC (Remote Procedure Call) named `upsert_ranking_delta`.
   - Pass the arguments: `p_player_name`, `p_rank_position`, `p_rating`, and `p_table_name` (either 'doubles_ratings_deltas' or 'singles_ratings_deltas').
3. **Environment Variables:** Use `PropertiesService` in GAS to store the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. **Trigger:** Provide a function called `createDailyTrigger` that sets the scraper to run automatically between 1 AM and 2 AM daily.

**Output Format:** Provide the complete .gs code ready to be pasted into the Google Apps Script editor.
