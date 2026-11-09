import { slugify } from './slugify';

export interface RecordRow {
  player_name: string;
  valid_from: string;
  rating: number;
  rounds_played: number;
  is_active: boolean | null;
}

export interface RecordEntry {
  name: string;
  slug: string;
  /** Pre-formatted figure, e.g. "5.688" or "+1.181" */
  value: string;
  /** Date the record was set; absent for running totals */
  date?: string;
  /** Short context, e.g. "3.752 to 4.933" */
  detail: string;
}

export interface DoublesRecords {
  firstRecorded: string;
  lastRecorded: string;
  highestRating: RecordEntry[];
  biggestClimb: RecordEntry[];
  biggestJump: RecordEntry[];
  mostRounds: RecordEntry[];
  mostUpdates: RecordEntry[];
}

const TOP = 5;

/** Below this, a rating is still settling and swings are mostly noise. */
export const MIN_ROUNDS_FOR_PEAK = 5;
export const MIN_ROUNDS_AT_START_OF_CLIMB = 5;
export const MIN_ROUNDS_BEFORE_JUMP = 10;

const signed = (n: number) => `+${n.toFixed(3)}`;

function top<T>(items: T[], score: (item: T) => number, toEntry: (item: T) => RecordEntry): RecordEntry[] {
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, TOP).map(toEntry);
}

/**
 * Builds the leaderboards from every doubles snapshot.
 * Rows must be sorted oldest first. Only currently listed players are ranked;
 * slugs in `hiddenSlugs` are excluded and spelling variants count as one player.
 */
export function computeDoublesRecords(rows: RecordRow[], hiddenSlugs: readonly string[]): DoublesRecords | null {
  if (rows.length === 0) return null;

  const bySlug = new Map<string, RecordRow[]>();
  for (const row of rows) {
    const slug = slugify(row.player_name);
    if (hiddenSlugs.includes(slug)) continue;
    const history = bySlug.get(slug);
    if (history) history.push(row);
    else bySlug.set(slug, [row]);
  }

  const players = [...bySlug]
    .filter(([, history]) => history[history.length - 1].is_active)
    .map(([slug, history]) => {
      const first = history[0];
      const current = history[history.length - 1];
      const peak = history.reduce((best, row) => (row.rating > best.rating ? row : best), first);
      return { slug, name: current.player_name, history, first, current, peak };
    });

  const entryBase = (p: (typeof players)[number]) => ({ name: p.name, slug: p.slug });

  const jumps = players.flatMap((p) =>
    p.history.slice(1).flatMap((row, i) => {
      const previous = p.history[i];
      return previous.rounds_played >= MIN_ROUNDS_BEFORE_JUMP && row.rating > previous.rating
        ? [{ p, previous, row, gain: row.rating - previous.rating }]
        : [];
    })
  );

  return {
    firstRecorded: rows[0].valid_from,
    lastRecorded: rows[rows.length - 1].valid_from,
    highestRating: top(
      players.filter((p) => p.current.rounds_played >= MIN_ROUNDS_FOR_PEAK),
      (p) => p.peak.rating,
      (p) => ({
        ...entryBase(p),
        value: p.peak.rating.toFixed(3),
        date: p.peak.valid_from,
        detail: `now ${p.current.rating.toFixed(3)}`,
      })
    ),
    biggestClimb: top(
      players.filter((p) => p.history.length > 1 && p.first.rounds_played >= MIN_ROUNDS_AT_START_OF_CLIMB && p.current.rating > p.first.rating),
      (p) => p.current.rating - p.first.rating,
      (p) => ({
        ...entryBase(p),
        value: signed(p.current.rating - p.first.rating),
        detail: `${p.first.rating.toFixed(3)} to ${p.current.rating.toFixed(3)}`,
      })
    ),
    biggestJump: top(
      jumps,
      (j) => j.gain,
      (j) => ({
        ...entryBase(j.p),
        value: signed(j.gain),
        date: j.row.valid_from,
        detail: `${j.previous.rating.toFixed(3)} to ${j.row.rating.toFixed(3)}`,
      })
    ),
    mostRounds: top(
      players,
      (p) => p.current.rounds_played,
      (p) => ({ ...entryBase(p), value: String(p.current.rounds_played), detail: 'rated rounds' })
    ),
    mostUpdates: top(
      players,
      (p) => p.history.length,
      (p) => ({ ...entryBase(p), value: String(p.history.length), detail: 'recorded updates' })
    ),
  };
}
