"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { SITE_NAME } from '@/lib/site-config';

export const NAV_ITEMS = [
  { label: 'Rankings', href: '/' },
  { label: 'Activity', href: '/activity' },
  { label: 'Records', href: '/records' },
  { label: 'Alerts', href: '/alerts' },
  { label: 'Tourney Check', href: '/tourney' },
  { label: 'About', href: '/about' },
];

/** Volt square mark + condensed wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5 font-display font-extrabold uppercase tracking-[0.02em] text-foreground', className)}>
      <span className="w-7 h-7 md:w-8 md:h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold text-base md:text-lg leading-none">
        C
      </span>
      {SITE_NAME}
    </span>
  );
}

export function Navigation() {
  const { fetchData, refreshing } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname.startsWith('/player');
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 z-[100] w-full h-14 md:h-[68px] bg-background shadow-hairline px-4 md:px-10 flex items-center">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        <Link href="/" className="text-[22px] md:text-2xl" aria-label={`${SITE_NAME} home`}>
          <Wordmark />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'font-display font-bold text-[13px] lg:text-[15px] uppercase tracking-[0.1em] lg:tracking-[0.18em] whitespace-nowrap py-[22px] transition-colors',
                isActive(item.href)
                  ? 'text-primary shadow-[inset_0_-3px_0_oklch(var(--primary))]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="lg:ml-2 w-9 lg:w-11 h-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin text-primary')} />
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="w-11 h-11 flex items-center justify-center text-muted-foreground active:text-primary transition-colors disabled:opacity-50"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin text-primary')} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="w-11 h-11 flex items-center justify-center text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="absolute top-14 left-0 w-full bg-secondary shadow-hairline md:hidden z-40"
          >
            <div className="flex flex-col p-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between h-12 px-3 rounded-md font-display font-bold text-lg uppercase tracking-[0.12em]',
                    isActive(item.href) ? 'text-primary bg-muted' : 'text-foreground'
                  )}
                >
                  {item.label}
                  {isActive(item.href) && <span className="live-dot" aria-hidden="true" />}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
