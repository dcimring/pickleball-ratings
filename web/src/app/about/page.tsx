import type { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { getCurrentRankings, getTrackingStats } from '@/lib/rankings-api';
import { LOCALE, OWNER_NAME, OWNER_URL, SITE_NAME, SITE_URL } from '@/lib/site-config';
import { slugify } from '@/lib/slugify';
import type { Ranking } from '@/lib/types';

export const revalidate = 3600;

const TITLE = 'About & Methodology: Cayman Islands Pickleball Ratings | CAYMANDINK';
const DESCRIPTION =
  'How CAYMANDINK tracks Cayman Islands pickleball ratings: where the data comes from, how often it updates, how ratings work and what each term means.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/about` },
};

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

const inlineLink = 'text-primary underline underline-offset-4';
const EXPLAINER_URL = 'https://www.pickleball.ky/rankings-explained/';

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-3">
      <h2 className="font-display font-bold uppercase tracking-[0.08em] text-xl md:text-2xl leading-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] md:text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Leader({ player, mode }: { player: Ranking; mode: 'doubles' | 'singles' }) {
  const query = mode === 'singles' ? '?tab=singles' : '';
  return (
    <>
      <Link href={`/player/${slugify(player.player_name)}${query}`} className={inlineLink}>
        {player.player_name}
      </Link>{' '}
      is No. 1 in {mode} with a {player.rating.toFixed(3)} rating, last updated {longDate(player.valid_from)}.
    </>
  );
}

export default async function AboutPage() {
  const [rankings, stats] = await Promise.all([getCurrentRankings(), getTrackingStats()]);
  const doublesLeader = rankings?.doubles[0];
  const singlesLeader = rankings?.singles[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    author: { '@type': 'Person', name: OWNER_NAME, url: OWNER_URL, sameAs: [OWNER_URL] },
  };

  return (
    <div className="pb-24 min-h-full bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow={['Methodology', 'Independent tracker']}
        kicker="How it works"
        title="About"
        lead={`${SITE_NAME} records how Cayman Islands pickleball ratings change over time, using the ratings published by Pickleball Cayman.`}
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
          <Question title="What is CAYMANDINK?">
            <p>
              {SITE_NAME} is an independent tracker of Cayman Islands pickleball ratings. It is not an official ranking
              and is not run by Pickleball Cayman. Pickleball Cayman publishes each player&apos;s latest rating;{' '}
              {SITE_NAME} keeps the history of how those ratings change.
            </p>
          </Question>

          <Question title="Who runs CAYMANDINK?">
            <p>
              {SITE_NAME} is built and run by {OWNER_NAME}, a pickleball player in the Cayman Islands. He started tracking
              rating changes in February 2026 because Pickleball Cayman publishes only each player&apos;s latest rating. He
              also built the Corporate League leaderboard for Pickleball Cayman. {SITE_NAME} itself is an independent
              project and is not run by Pickleball Cayman.{' '}
              <a href={OWNER_URL} className={inlineLink} rel="author noopener">
                More about Daniel
              </a>
            </p>
          </Question>

          {doublesLeader && (
            <Question title="Who is the top-rated pickleball player in the Cayman Islands?">
              <p>
                On the Pickleball Cayman club ratings, <Leader player={doublesLeader} mode="doubles" />
                {singlesLeader && (
                  <>
                    {' '}
                    <Leader player={singlesLeader} mode="singles" />
                  </>
                )}{' '}
                See the <Link href="/" className={inlineLink}>full rankings</Link>.
              </p>
            </Question>
          )}

          <Question title="Where does the data come from?">
            <p>
              Ratings and rankings come from{' '}
              <a href="https://www.pickleball.ky/rankings/" className={inlineLink} rel="noopener">
                pickleball.ky
              </a>
              , the Pickleball Cayman website.
              {stats && (
                <>
                  {' '}
                  {SITE_NAME} has stored every recorded change since {longDate(stats.firstRecorded)}, currently{' '}
                  {stats.snapshots.toLocaleString(LOCALE)} rating snapshots.
                </>
              )}{' '}
              Nothing before that date is available.
            </p>
          </Question>

          <Question title="How often are Cayman pickleball ratings updated?">
            <p>
              {SITE_NAME} checks pickleball.ky once a day. A rating only changes after new rated games are published
              there, so a player&apos;s rating can stay the same for weeks.
            </p>
          </Question>

          <Question title="How are the ratings calculated?">
            <p>
              Pickleball Cayman calculates the ratings; {SITE_NAME} does not change them. According to its{' '}
              <a href={EXPLAINER_URL} className={inlineLink} rel="noopener">
                rankings explainer
              </a>
              , a match produces a predicted score from the average ratings of each pair. Beating that prediction raises
              your rating and falling short lowers it, except that a winning side does not lose rating.
            </p>
          </Question>

          <Question title="What do the terms on this site mean?">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="font-semibold text-foreground">Rating</dt>
              <dd>The player&apos;s score from Pickleball Cayman, shown to three decimal places.</dd>
              <dt className="font-semibold text-foreground">Rank</dt>
              <dd>The player&apos;s position on the doubles or singles list.</dd>
              <dt className="font-semibold text-foreground">Rounds</dt>
              <dd>The number of rated rounds pickleball.ky reports for the player.</dd>
              <dt className="font-semibold text-foreground">Peak</dt>
              <dd>The highest rating recorded here since tracking began.</dd>
              <dt className="font-semibold text-foreground">Snapshot</dt>
              <dd>One saved record of a player&apos;s rating and rank after a change.</dd>
              <dt className="font-semibold text-foreground">Not currently listed</dt>
              <dd>The player no longer appears on pickleball.ky. Their last recorded rating stays on their profile.</dd>
            </dl>
          </Question>

          <Question title="Can I remove my profile or report a mistake?">
            <p>
              Yes. You can <Link href="/remove" className={inlineLink}>request removal of your profile</Link>. To report a
              mistake, use the <Link href="/suggest" className={inlineLink}>suggestion form</Link>.
            </p>
          </Question>
        </div>
      </div>
    </div>
  );
}
