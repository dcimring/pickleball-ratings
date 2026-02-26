/**
 * Pickleball Rankings Scraper & Supabase Integration (Optimized Bulk Version)
 * 
 * Instructions:
 * 1. Open Google Apps Script (script.google.com).
 * 2. Paste this code into the editor.
 * 3. Go to Project Settings (gear icon) -> Script Properties.
 * 4. Add 'SUPABASE_URL' and 'SUPABASE_SERVICE_ROLE_KEY'.
 * 5. Run 'createDailyTrigger' once to schedule the daily scrape.
 */

const CONFIG = {
  DOUBLES_URL: 'https://www.pickleball.ky/rankings/',
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

  // 1. Scrape Doubles
  console.log('Starting Doubles scrape...');
  scrapeAndSync(CONFIG.DOUBLES_URL, 'doubles_ratings_deltas', supabaseUrl, supabaseKey);

  // 2. Scrape Singles
  console.log('Starting Singles scrape...');
  scrapeAndSync(CONFIG.SINGLES_URL, 'singles_ratings_deltas', supabaseUrl, supabaseKey);

  console.log('Scrape and Sync complete.');
}

/**
 * Fetches the URL, parses the table, and sends a bulk update to Supabase.
 */
function scrapeAndSync(url, tableName, supabaseUrl, supabaseKey) {
  try {
    const response = UrlFetchApp.fetch(url);
    const html = response.getContentText();
    
    // Regex targets TablePress row structure
    const rowRegex = /<tr class="row-\d+">[\s\S]*?<td class="column-1">(\d+)<\/td>[\s\S]*?<td class="column-2">([^<]+)<\/td>[\s\S]*?<td class="column-3">([\d\.]+)<\/td>/gi;
    
    let match;
    let players = [];
    let seenNames = {}; // Track names already processed in this table
    
    while ((match = rowRegex.exec(html)) !== null) {
      const rank = parseInt(match[1]);
      const name = match[2].trim();
      const rating = parseFloat(match[3]);
      
      if (!isNaN(rank) && name && !isNaN(rating)) {
        if (!seenNames[name]) {
          seenNames[name] = true;
          players.push({
            player_name: name,
            rank_position: rank,
            rating: rating
          });
        } else {
          console.warn(`Skipping duplicate entry for ${name} at rank ${rank}`);
        }
      }
    }
    
    if (players.length > 0) {
      console.log(`Collected ${players.length} unique players for ${tableName}. Sending to Supabase...`);
      sendBulkToSupabase(supabaseUrl, supabaseKey, {
        p_rows: players,
        p_table_name: tableName
      });
    } else {
      console.warn(`No players found for ${tableName}. Check if the website structure has changed.`);
    }
    
  } catch (error) {
    console.error(`Error processing ${url}: ${error.message}`);
  }
}

/**
 * Calls the Supabase Bulk RPC.
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
    console.error(`Supabase RPC Error (${responseCode}): ${response.getContentText()}`);
  } else {
    console.log(`Successfully synced ${payload.p_table_name}`);
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
