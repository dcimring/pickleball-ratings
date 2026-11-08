"use client";

import Image from 'next/image';
import { ArrowUpRight, Bell, Star, TrendingUp } from 'lucide-react';
import { WHATSAPP_GROUP_URL } from '@/lib/site-config';
import { PageHero } from '@/components/PageHero';

const PERKS = [
  {
    icon: TrendingUp,
    title: 'Weekly movers digest',
    body: 'Every week: top risers, fallers and anyone who cracked the top 20.',
  },
  {
    icon: Star,
    title: 'Milestones',
    body: 'New leaders, personal bests and first-time rankings.',
  },
  {
    icon: Bell,
    title: 'One message a week, at most',
    body: 'Ratings only change daily, so there is nothing to spam you with.',
  },
];

export function Alerts() {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&bgcolor=141b18&color=f2f5f3&data=${encodeURIComponent(WHATSAPP_GROUP_URL)}`;

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Alerts', 'WhatsApp', 'Free']}
        kicker="Never miss a move"
        title="Alerts"
        lead="Rating changes land once a day. Get the ones that matter in the place Cayman pickleball already lives: WhatsApp."
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3.5 md:gap-6 md:items-start">
          {/* Join card */}
          <div className="bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-4 md:flex-[1_1_380px]">
            <div className="flex items-center gap-3.5">
              <span className="w-13 h-13 w-[52px] h-[52px] rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L4 21l1.6-4.4A8.5 8.5 0 1 1 21 12z" />
                  <path d="M9 10h.01M12 10h.01M15 10h.01" />
                </svg>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="kicker text-[13px] text-primary">WhatsApp group</span>
                <span className="font-sans font-semibold text-lg leading-tight">Cayman Pickleball Alerts</span>
              </span>
            </div>

            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[52px] rounded-md bg-primary text-primary-foreground font-display font-bold text-[15px] uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Join on WhatsApp
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* QR for laptop visitors */}
            <div className="hidden md:flex items-center gap-5 pt-2">
              <div className="bg-secondary rounded-md shadow-outline p-2 shrink-0">
                <Image src={qrCodeUrl} alt="QR code for the WhatsApp group invite" width={144} height={144} className="w-36 h-36 rounded" unoptimized />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Scan with your phone camera to open the invite in WhatsApp.</p>
            </div>
            <p className="md:hidden text-xs text-muted-foreground text-center">On a laptop? The desktop page shows a QR code to scan.</p>
          </div>

          {/* What you get */}
          <div className="flex flex-col gap-2.5 md:flex-[999_1_480px]">
            <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base md:text-xl">What lands in the group</h2>
            <div className="bg-secondary rounded-lg flex flex-col">
              {PERKS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 items-center px-3 py-3.5 shadow-hairline last:shadow-none">
                  <span className="w-11 h-11 rounded-md bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-sans font-semibold text-[15px]">{title}</span>
                    <span className="text-xs md:text-[13px] text-muted-foreground">{body}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed pt-1">
              Prefer a link? Every player page has a Share card you can post to any group yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
