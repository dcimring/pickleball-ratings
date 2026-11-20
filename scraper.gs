/**
 * Pickleball Rankings Scraper & Supabase Integration (Optimized Bulk Version)
 *
 * Instructions:
 * 1. Open Google Apps Script (script.google.com).
 * 2. Paste this code into the editor.
 * 3. Go to Project Settings (gear icon) -> Script Properties.
 * 4. Add 'SUPABASE_URL' and 'SUPABASE_SERVICE_ROLE_KEY'.
 *    Optionally add 'ALERT_EMAIL' to receive failure notifications
 *    (defaults to the script owner's email).
 * 5. Run 'createDailyTrigger' once to schedule the daily scrape.
 */

const CONFIG = {
  // Doubles moved (Nov 2026) from a TablePress table at pickleball.ky/rankings/ to
  // pickleball.ky/pbratings/, which iframes a Next.js app at rankings.pickleball.ky.
  // That app loads its table from this JSON endpoint (same query the page makes).
  DOUBLES_API_URL: 'https://rankings.pickleball.ky/api/players?limit=1000&isApproved=true&isHide=false',
  SINGLES_URL: 'https://www.pickleball.ky/singles-rankings/',
  SUPABASE_RPC_NAME: 'upsert_ranking_delta_bulk'
};

/**
 * Main entry point for the scraper.
 */
function runScraper() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const supabaseUrl = scriptProperties.getProperty('SUPABASE_URL');
  const supabaseKey = scriptProperties.getProperty('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Script Properties.');
  }

  const failures = [];

  // 1. Scrape Doubles
  console.log('Starting Doubles scrape...');
  const doublesError = scrapeAndSync(CONFIG.DOUBLES_API_URL, 'doubles_ratings_deltas', parseDoublesApi, supabaseUrl, supabaseKey);
  if (doublesError) failures.push(doublesError);

  // 2. Scrape Singles
  console.log('Starting Singles scrape...');
  const singlesError = scrapeAndSync(CONFIG.SINGLES_URL, 'singles_ratings_deltas', parseTablePress, supabaseUrl, supabaseKey);
  if (singlesError) failures.push(singlesError);

  if (failures.length > 0) {
    sendFailureAlert(failures);
  }

  console.log('Scrape and Sync complete.');
}

/**
 * Fetches the URL, parses it with `parser`, and sends a bulk update to Supabase.
 * Returns null on success, or a description of the failure.
 */
function scrapeAndSync(url, tableName, parser, supabaseUrl, supabaseKey) {
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();
    if (code !== 200) {
      const msg = `HTTP ${code} fetching ${url} for ${tableName}.`;
      console.error(msg);
      return msg;
    }

    const players = dedupePlayers(parser(response.getContentText()));

    if (players.length === 0) {
      const msg = `No players found for ${tableName} at ${url}. The website structure may have changed.`;
      console.warn(msg);
      return msg;
    }

    console.log(`Collected ${players.length} unique players for ${tableName}. Sending to Supabase...`);
    return sendBulkToSupabase(supabaseUrl, supabaseKey, {
      p_rows: players,
      p_table_name: tableName
    });

  } catch (error) {
    const msg = `Error processing ${url}: ${error.message}`;
    console.error(msg);
    return msg;
  }
}

/**
 * Parses the rankings.pickleball.ky players API (doubles).
 * Response shape: { players: [{ playerName, rank, currentRank: "4.186", RRPlayed, ... }], total, ... }
 */
function parseDoublesApi(body) {
  const data = JSON.parse(body);
  if (!data || !Array.isArray(data.players)) {
    throw new Error('Unexpected API response: missing players array');
  }
  if (data.hasMore) {
    console.warn(`API reports more pages (total ${data.total}); only the first page was read.`);
  }
  return data.players
    .filter(p => p.currentRank) // the site hides players without a rating
    .map(p => ({
      player_name: String(p.playerName || '').trim(),
      rank_position: parseInt(p.rank),
      rating: parseFloat(p.currentRank),
      rounds_played: parseInt(p.RRPlayed)
    }));
}

/**
 * Parses a TablePress table (singles page) with 4 columns:
 * <td class="column-1">RANK</td><td class="column-2">NAME</td><td class="column-3">RATING</td><td class="column-4">ROUNDS</td>
 */
function parseTablePress(html) {
  const rowRegex = /<tr class="row-\d+">[\s\S]*?<td class="column-1">(\d+)<\/td>[\s\S]*?<td class="column-2">([^<]+)<\/td>[\s\S]*?<td class="column-3">([\d\.]+)<\/td>[\s\S]*?<td class="column-4">(\d+)<\/td>/gi;
  const rows = [];
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    rows.push({
      player_name: match[2].trim(),
      rank_position: parseInt(match[1]),
      rating: parseFloat(match[3]),
      rounds_played: parseInt(match[4])
    });
  }
  return rows;
}

/**
 * Drops invalid rows and keeps only the first (best-ranked) entry per name.
 */
function dedupePlayers(rows) {
  const players = [];
  const seenNames = {};
  rows
    .filter(r => r.player_name && !isNaN(r.rank_position) && !isNaN(r.rating) && !isNaN(r.rounds_played))
    .sort((a, b) => a.rank_position - b.rank_position)
    .forEach(r => {
      if (seenNames[r.player_name]) {
        console.warn(`Skipping duplicate entry for ${r.player_name} at rank ${r.rank_position}`);
        return;
      }
      seenNames[r.player_name] = true;
      players.push(r);
    });
  return players;
}

/**
 * Calls the Supabase Bulk RPC.
 * Returns null on success, or a description of the failure.
 */
function sendBulkToSupabase(url, key, payload) {
  const rpcUrl = `${url}/rest/v1/rpc/${CONFIG.SUPABASE_RPC_NAME}`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Accept-Profile': 'pickleball_ratings',
      'Content-Profile': 'pickleball_ratings'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(rpcUrl, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200 && responseCode !== 204) {
    const msg = `Supabase RPC error for ${payload.p_table_name} (HTTP ${responseCode}): ${response.getContentText()}`;
    console.error(msg);
    return msg;
  }

  console.log(`Successfully synced ${payload.p_table_name}`);
  return null;
}

/**
 * Emails a failure summary so broken scrapes don't go unnoticed.
 */
function sendFailureAlert(failures) {
  try {
    const recipient = PropertiesService.getScriptProperties().getProperty('ALERT_EMAIL')
      || Session.getEffectiveUser().getEmail();
    MailApp.sendEmail(
      recipient,
      'CAYMANDINK scraper failure',
      'The daily pickleball rankings scrape had problems:\n\n- '
        + failures.join('\n- ')
        + '\n\nCheck the Apps Script execution log at https://script.google.com for details.'
    );
  } catch (error) {
    console.error(`Failed to send alert email: ${error.message}`);
  }
}

/**
 * Creates a daily trigger to run between 1 AM and 2 AM.
 */
function createDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'runScraper') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('runScraper')
    .timeBased()
    .atHour(1)
    .everyDays(1)
    .create();

  console.log('Daily trigger created successfully (1 AM - 2 AM).');
}
