/**
 * Pickleball Rankings Scraper & Supabase Integration (Optimized Bulk Version)
 *
 * Instructions:
 * 1. Open Google Apps Script (script.google.com).
 * 2. Paste this code into the editor.
 * 3. Go to Project Settings (gear icon) -> Script Properties.
 * 4. Add 'SUPABASE_URL' and 'SUPABASE_SERVICE_ROLE_KEY'.
 *    Add 'DISCORD_WEBHOOK_URL' to get failures and name-change reports in Discord.
 *    Without it, alerts fall back to email ('ALERT_EMAIL', or the script owner).
 * 5. Run 'createDailyTrigger' once to schedule the daily scrape.
 *    Run 'testDiscordAlert' once to check the webhook.
 */

const CONFIG = {
  // Doubles moved (Nov 2026) from a TablePress table at pickleball.ky/rankings/ to
  // pickleball.ky/pbratings/, which iframes a Next.js app at rankings.pickleball.ky.
  // That app loads its table from this JSON endpoint (same query the page makes).
  DOUBLES_API_URL: 'https://rankings.pickleball.ky/api/players?limit=1000&isApproved=true&isHide=false',
  SINGLES_URL: 'https://www.pickleball.ky/singles-rankings/',
  SUPABASE_RPC_NAME: 'upsert_ranking_delta_bulk',
  SUPABASE_SCHEMA: 'pickleball_ratings',
  // The site menu (Club → Rankings …) is watched so a moved page gets noticed.
  HOME_URL: 'https://www.pickleball.ky/',
  // Alert when no rating has changed for this many days. Doubles has never gone
  // more than ~4 days without a change except when its page moved (Nov 2026).
  // Singles is left out: it legitimately goes months without a change.
  STALE_AFTER_DAYS: { doubles_ratings_deltas: 7 }
};

// Source spelling -> name already used in our history. Doubles players are matched
// on pickleball.ky's player id, so this is mainly for singles (no ids) and for a
// rename the Discord report flags as a likely match.
const NAME_ALIASES = {
  'Tj Hucker': 'TJ Hucker', // new doubles API (Nov 2026)
  'Natalia Guzm�n': 'Natalia Guzmán' // new doubles API sends a broken "á" (Nov 2026)
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
  const notices = [];
  const supabase = { url: supabaseUrl, key: supabaseKey };

  console.log('Starting Doubles scrape...');
  scrapeAndSync(CONFIG.DOUBLES_API_URL, 'doubles_ratings_deltas', parseDoublesApi, supabase, failures, notices);

  console.log('Starting Singles scrape...');
  scrapeAndSync(CONFIG.SINGLES_URL, 'singles_ratings_deltas', parseTablePress, supabase, failures, notices);

  // Catch a source that moves or goes stale while still "working".
  const warnings = [];
  Object.keys(CONFIG.STALE_AFTER_DAYS).forEach(tableName => {
    checkStaleness(supabase, tableName, CONFIG.STALE_AFTER_DAYS[tableName], warnings);
  });
  checkRankingsMenu(warnings);

  if (failures.length > 0) {
    sendAlert('🚨 CAYMANDINK scraper failure', failures.concat(['Check the Apps Script execution log at https://script.google.com']));
  }
  if (warnings.length > 0) {
    sendAlert('⚠️ CAYMANDINK source check', warnings);
  }
  if (notices.length > 0) {
    sendAlert('👀 CAYMANDINK player name check', notices.concat([
      'If two names are the same person, add the pickleball.ky spelling to NAME_ALIASES in scraper.gs.'
    ]));
  }

  console.log('Scrape and Sync complete.');
}

/**
 * Fetches the URL, parses it with `parser`, checks names against what we already
 * store, and sends a bulk update to Supabase. Problems go into `failures`, name
 * changes worth a human look go into `notices`.
 */
function scrapeAndSync(url, tableName, parser, supabase, failures, notices) {
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();
    if (code !== 200) {
      failures.push(`HTTP ${code} fetching ${url} for ${tableName}.`);
      return;
    }

    const players = dedupePlayers(parser(response.getContentText()));

    if (players.length === 0) {
      failures.push(`No players found for ${tableName} at ${url}. The website structure may have changed.`);
      return;
    }

    // Compare against our current rows before syncing, so renames and new
    // lookalike names are seen against the previous state.
    try {
      const existing = fetchCurrentPlayers(supabase, tableName);
      buildNameReport(players, existing, tableName).forEach(line => notices.push(line));
    } catch (error) {
      notices.push(`Couldn't run the name check for ${tableName}: ${error.message}`);
    }

    console.log(`Collected ${players.length} unique players for ${tableName}. Sending to Supabase...`);
    const error = sendBulkToSupabase(supabase, { p_rows: players, p_table_name: tableName });
    if (error) failures.push(error);

  } catch (error) {
    const msg = `Error processing ${url}: ${error.message}`;
    console.error(msg);
    failures.push(msg);
  }
}

/**
 * Parses the rankings.pickleball.ky players API (doubles).
 * Response shape: { players: [{ id, playerName, rank, currentRank: "4.186", RRPlayed, ... }], total, ... }
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
      rounds_played: parseInt(p.RRPlayed),
      source_player_id: Number.isInteger(p.id) ? p.id : null
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
 * Applies NAME_ALIASES, drops invalid rows and keeps only the first (best-ranked) entry per name.
 */
function dedupePlayers(rows) {
  const players = [];
  const seenNames = {};
  rows
    .map(r => Object.assign({}, r, { player_name: NAME_ALIASES[r.player_name] || r.player_name }))
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
 * Reads every player's current row (listed or not) from Supabase.
 */
function fetchCurrentPlayers(supabase, tableName) {
  const url = `${supabase.url}/rest/v1/${tableName}?select=player_name,source_player_id,is_active&is_current=eq.true`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': supabase.key,
      'Authorization': `Bearer ${supabase.key}`,
      'Accept-Profile': CONFIG.SUPABASE_SCHEMA
    },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error(`HTTP ${response.getResponseCode()}: ${response.getContentText()}`);
  }
  return JSON.parse(response.getContentText());
}

/**
 * Lists name changes worth a human look:
 * - a known pickleball.ky id arriving under a new name (we keep our existing name);
 * - a brand-new name that looks like a name we already have (possible rename or
 *   duplicate registration). Only reported on the day the new name first appears.
 */
function buildNameReport(players, existing, tableName) {
  const label = tableName.replace('_ratings_deltas', '');
  const nameById = {};
  const existingByName = {};
  existing.forEach(row => {
    existingByName[row.player_name] = row;
    if (row.source_player_id != null) nameById[row.source_player_id] = row.player_name;
  });
  const scrapedNames = {};
  players.forEach(p => { scrapedNames[p.player_name] = true; });

  const lines = [];
  players.forEach(p => {
    const knownName = p.source_player_id != null ? nameById[p.source_player_id] : undefined;
    if (knownName !== undefined) {
      if (knownName !== p.player_name) {
        lines.push(`[${label}] pickleball.ky renamed "${knownName}" to "${p.player_name}" (id ${p.source_player_id}). Kept "${knownName}" so their history and page URL stay the same.`);
      }
      return;
    }
    if (existingByName[p.player_name]) return; // known name

    const similar = existing
      .filter(row => row.player_name !== p.player_name && namesLookAlike(row.player_name, p.player_name))
      .map(row => {
        const status = scrapedNames[row.player_name] ? 'still listed' : (row.is_active ? 'no longer listed' : 'hidden');
        return `"${row.player_name}" (${status})`;
      });
    if (similar.length > 0) {
      lines.push(`[${label}] New name "${p.player_name}" looks like ${similar.join(', ')}. Recorded as a new player.`);
    }
  });
  return lines;
}

/**
 * True when two names probably refer to the same person: identical ignoring case,
 * accents and punctuation; a small typo; or the same surname with one first name
 * a prefix of the other ("Chris Amores" / "Christopher Amores").
 */
function namesLookAlike(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  const flatA = na.replace(/ /g, '');
  const flatB = nb.replace(/ /g, '');
  if (flatA === flatB) return true;

  const maxLen = Math.max(flatA.length, flatB.length);
  if (maxLen >= 6 && levenshtein(flatA, flatB) <= Math.max(1, Math.floor(maxLen * 0.12))) return true;

  const pa = na.split(' ');
  const pb = nb.split(' ');
  if (pa.length >= 2 && pb.length >= 2 && pa[pa.length - 1] === pb[pb.length - 1]) {
    const fa = pa[0];
    const fb = pb[0];
    if (fa.length >= 2 && fb.length >= 2 && (fa.startsWith(fb) || fb.startsWith(fa))) return true;
  }
  return false;
}

function normalizeName(name) {
  return String(name)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Warns when no rating in `tableName` has changed for `maxDays` — the sign of a
 * source page that still loads but stopped updating. Warns once per quiet spell:
 * the date warned about is remembered, and a new change resets it.
 */
function checkStaleness(supabase, tableName, maxDays, warnings) {
  try {
    const url = `${supabase.url}/rest/v1/${tableName}?select=valid_from&order=valid_from.desc&limit=1`;
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'apikey': supabase.key,
        'Authorization': `Bearer ${supabase.key}`,
        'Accept-Profile': CONFIG.SUPABASE_SCHEMA
      },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() !== 200) {
      throw new Error(`HTTP ${response.getResponseCode()}: ${response.getContentText()}`);
    }
    const rows = JSON.parse(response.getContentText());
    if (rows.length === 0) return;

    const lastChange = rows[0].valid_from; // YYYY-MM-DD
    const days = Math.floor((Date.now() - new Date(`${lastChange}T00:00:00Z`).getTime()) / 86400000);
    if (days < maxDays) return;

    const props = PropertiesService.getScriptProperties();
    const key = `STALE_WARNED_${tableName}`;
    if (props.getProperty(key) === lastChange) return;

    const label = tableName.replace('_ratings_deltas', '');
    warnings.push(`No ${label} rating has changed since ${lastChange} (${days} days). pickleball.ky may have moved or stopped updating the ${label} page. Check the Club menu on ${CONFIG.HOME_URL}`);
    props.setProperty(key, lastChange);
  } catch (error) {
    warnings.push(`Couldn't run the staleness check for ${tableName}: ${error.message}`);
  }
}

/**
 * Watches the Rankings links in the pickleball.ky site menu (Club → Rankings – …).
 * The first run saves them; later runs warn once when a link is added, removed or
 * pointed somewhere else, then save the new set.
 */
function checkRankingsMenu(warnings) {
  try {
    const response = UrlFetchApp.fetch(CONFIG.HOME_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      warnings.push(`Couldn't load ${CONFIG.HOME_URL} to check the Rankings menu links (HTTP ${response.getResponseCode()}).`);
      return;
    }

    const current = extractRankingsMenuLinks(response.getContentText());
    if (current.length === 0) {
      warnings.push(`No Rankings links found in the pickleball.ky menu. The menu or site may have changed: check the Club menu on ${CONFIG.HOME_URL}`);
      return; // keep the saved set so the next good run still compares against it
    }

    const props = PropertiesService.getScriptProperties();
    const KEY = 'RANKINGS_MENU_LINKS';
    const saved = props.getProperty(KEY);
    props.setProperty(KEY, JSON.stringify(current));
    if (!saved) {
      console.log(`Saved Rankings menu links: ${current.join('; ')}`);
      return;
    }

    const previous = JSON.parse(saved);
    const added = current.filter(link => previous.indexOf(link) === -1);
    const removed = previous.filter(link => current.indexOf(link) === -1);
    if (added.length === 0 && removed.length === 0) return;

    warnings.push(`The Rankings links in the pickleball.ky menu changed. Check the scraper still reads the right pages (doubles: ${CONFIG.DOUBLES_API_URL}, singles: ${CONFIG.SINGLES_URL}).`);
    removed.forEach(link => warnings.push(`Removed: ${link}`));
    added.forEach(link => warnings.push(`Added: ${link}`));
  } catch (error) {
    warnings.push(`Couldn't check the Rankings menu links: ${error.message}`);
  }
}

/**
 * Returns sorted, unique "Label → URL" strings for site-menu links whose label
 * mentions rankings or ratings.
 */
function extractRankingsMenuLinks(html) {
  const itemRegex = /<li[^>]*class="[^"]*menu-item[^"]*"[^>]*>\s*<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const links = {};
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const label = decodeEntities(match[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    if (/rank|rating/i.test(label)) links[`${label} → ${decodeEntities(match[1])}`] = true;
  }
  return Object.keys(links).sort();
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Calls the Supabase Bulk RPC.
 * Returns null on success, or a description of the failure.
 */
function sendBulkToSupabase(supabase, payload) {
  const rpcUrl = `${supabase.url}/rest/v1/rpc/${CONFIG.SUPABASE_RPC_NAME}`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': supabase.key,
      'Authorization': `Bearer ${supabase.key}`,
      'Accept-Profile': CONFIG.SUPABASE_SCHEMA,
      'Content-Profile': CONFIG.SUPABASE_SCHEMA
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
 * Posts an alert to Discord (DISCORD_WEBHOOK_URL), falling back to email if the
 * webhook isn't set or the post fails, so alerts never vanish silently.
 */
function sendAlert(title, lines) {
  const props = PropertiesService.getScriptProperties();
  const webhook = props.getProperty('DISCORD_WEBHOOK_URL');
  if (webhook && postToDiscord(webhook, title, lines)) return;

  try {
    const recipient = props.getProperty('ALERT_EMAIL') || Session.getEffectiveUser().getEmail();
    MailApp.sendEmail(recipient, title.replace(/^\W+\s*/, ''), '- ' + lines.join('\n- '));
  } catch (error) {
    console.error(`Failed to send alert email: ${error.message}`);
  }
}

/**
 * Sends the lines as one or more Discord messages (each under the 2000-char limit).
 * Returns true if every message was accepted.
 */
function postToDiscord(webhook, title, lines) {
  const LIMIT = 1900;
  const messages = [];
  let current = `**${title}**`;
  lines.forEach(line => {
    const item = `\n• ${line}`.slice(0, LIMIT);
    if (current.length + item.length > LIMIT) {
      messages.push(current);
      current = `**${title} (cont.)**`;
    }
    current += item;
  });
  messages.push(current);

  try {
    return messages.every(content => {
      const response = UrlFetchApp.fetch(webhook, {
        method: 'post',
        contentType: 'application/json',
        // flags 4 = SUPPRESS_EMBEDS: no link-preview cards for the URLs in alerts.
        payload: JSON.stringify({ content: content, allowed_mentions: { parse: [] }, flags: 4 }),
        muteHttpExceptions: true
      });
      const code = response.getResponseCode();
      if (code < 200 || code >= 300) {
        console.error(`Discord webhook returned HTTP ${code}: ${response.getContentText()}`);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error(`Discord webhook failed: ${error.message}`);
    return false;
  }
}

/**
 * Run once by hand to check the Discord webhook.
 */
function testDiscordAlert() {
  sendAlert('✅ CAYMANDINK scraper test', ['Discord alerts are working.']);
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
