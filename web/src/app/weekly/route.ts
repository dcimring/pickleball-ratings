import { redirect } from 'next/navigation';

/**
 * Clean short link for the weekly WhatsApp Movers digest.
 * Keeps the message URL pretty (dinkdash.xyz/weekly) while tagging the
 * click-through so digest traffic is measurable in analytics.
 * See docs/weekly-movers-digest.md.
 */
export function GET() {
  redirect('/activity?utm_source=whatsapp&utm_medium=digest&utm_campaign=weekly-movers');
}
