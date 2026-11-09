import { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { getDoublesRecords } from '@/lib/rankings-api';
import {
  MIN_ROUNDS_AT_START_OF_CLIMB,
  MIN_ROUNDS_BEFORE_JUMP,
  MIN_ROUNDS_FOR_PEAK,
  RecordEntry,
} from '@/lib/records';
import { LOCALE, OWNER_NAME, OWNER_URL, SITE_NAME, SITE_URL } from '@/lib/site-config';

export const revalidate = 3600;

const TITLE = 'Cayman Islands Pickleball Records: Highest Ratings & Biggest Climbs | CAYMANDINK';
const DESCRIPTION =
  'Doubles records for Cayman Islands pickleball: highest ratings reached, biggest rating climbs, biggest single jumps and most rated rounds, from every recorded rating change.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/records' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/records`, images: ['/og-image.jpg'] },
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

function Board({ title, description, entries }: { title: string; description: string; entries: RecordEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-3 min-w-0">
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-bold uppercase tracking-[0.08em] text-xl md:text-2xl leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <table className="w-full">
        <caption className="sr-only">{title}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Position</th>
            <th scope="col">Player</th>
            <th scope="col">Record</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={`${entry.slug}-${entry.date ?? index}`} className="shadow-hairline last:shadow-none">
              <td className={`numeral text-2xl w-9 py-2.5 align-middle ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {index + 1}
              </td>
              <td className="py-2.5 pr-3 align-middle">
                <Link href={`/player/${entry.slug}`} className="font-sans font-semibold text-base hover:text-primary transition-colors">
                  {entry.name}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {entry.detail}
                  {entry.date && ` · ${shortDate(entry.date)}`}
                </span>
              </td>
              <td className="numeral text-2xl md:text-[28px] text-right whitespace-nowrap py-2.5 align-middle">{entry.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function RecordsPage() {
  const records = await getDoublesRecords();
  const leader = records?.highestRating[0];
  const climber = records?.biggestClimb[0];

  const jsonLd = records && {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/records`,
    dateModified: records.lastRecorded,
    author: { '@type': 'Person', name: OWNER_NAME, url: OWNER_URL, sameAs: [OWNER_URL] },
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Highest Cayman Islands doubles pickleball ratings reached',
      itemListElement: records.highestRating.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        url: `${SITE_URL}/player/${entry.slug}`,
      })),
    },
  };

  return (
    <div className="pb-24 min-h-full bg-background">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PageHero
        eyebrow={['Records', 'Doubles', records ? `Since ${shortDate(records.firstRecorded)}` : 'Updating']}
        kicker="Cayman Islands pickleball"
        title="Records"
        lead={
          leader?.date && climber ? (
            <>
              Among players currently listed, {leader.name} holds the highest recorded doubles rating at {leader.value},
              set on {longDate(leader.date)}. {climber.name} has made the biggest climb, gaining {climber.value.slice(1)}{' '}
              since tracking began.
            </>
          ) : undefined
        }
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-3.5">
          {records ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Board title="Highest rating reached" description="The best rating each player has recorded." entries={records.highestRating} />
                <Board title="Biggest climb" description="Rating gained from a player's first recorded rating to today." entries={records.biggestClimb} />
                <Board title="Biggest single jump" description="The largest rise between two recorded updates." entries={records.biggestJump} />
                <Board title="Most rated rounds" description="Total rated rounds reported on pickleball.ky." entries={records.mostRounds} />
                <Board title="Most rating updates" description="How many times a player's record has changed." entries={records.mostUpdates} />
              </div>

              <section className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground max-w-3xl px-1 pt-2">
                <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base text-foreground">How these are counted</h2>
                <p>
                  Records cover doubles from {longDate(records.firstRecorded)} onward, when tracking began, and only
                  include players currently listed on pickleball.ky, so earlier results and former players aren&apos;t
                  counted. Singles will be added once there is enough history.
                </p>
                <p>
                  New ratings swing widely, so highest rating needs at least {MIN_ROUNDS_FOR_PEAK} rounds, a climb must
                  start from a rating with at least {MIN_ROUNDS_AT_START_OF_CLIMB} rounds, and a single jump needs at
                  least {MIN_ROUNDS_BEFORE_JUMP} rounds beforehand. One update can include several matches.{' '}
                  <Link href="/about" className="text-primary underline underline-offset-4">How the data works</Link>
                </p>
              </section>
            </>
          ) : (
            <p className="bg-secondary rounded-lg py-16 text-center text-muted-foreground">Records are unavailable right now. Please check back soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
