/** A self-rating line such as "3.5" or "4.0" on a tournament-site player list. */
const RATING_LINE = /^\d\.\d{1,3}$/;

/** Lines that are never a player name: placeholders, numbers, single letters (gender). */
function isJunk(line: string): boolean {
  if (!/\p{L}/u.test(line)) return true; // "--", "22", "3.5"
  if (/^\p{L}$/u.test(line)) return true; // "M", "F"
  return false;
}

/**
 * Pulls player names out of pasted text.
 *
 * Plain lists (one name per line) pass through. Lists copied from tournament
 * sites come as blocks of name / rating / age / gender / location, e.g.
 *
 *   Jonah Edelson
 *   4.0
 *   22
 *   M
 *   Chicago IL
 *
 * When the paste contains rating lines, a name is the line directly above a
 * rating, which drops locations ("West Bay") and UI text ("Send partner request").
 * Names are de-duplicated case-insensitively, keeping the first spelling.
 */
export function parseRoster(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const structured = lines.some((l) => RATING_LINE.test(l));
  const candidates = structured
    ? lines.filter((l, i) => RATING_LINE.test(lines[i + 1] ?? '') && !isJunk(l))
    : lines.filter((l) => !isJunk(l));

  const seen = new Set<string>();
  return candidates.filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
