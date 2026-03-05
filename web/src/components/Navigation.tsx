"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export function Navigation() {
  const { fetchData, refreshing } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'RANKINGS', href: '/' },
    { label: 'ACTIVITY', href: '/activity' },
    { label: 'ALERTS', href: '/alerts' },
    { label: 'TOURNEY CHECK', href: '/tourney' },
    { label: 'SUGGEST FEATURE', href: '/suggest' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-white/10 px-6 py-3 shadow-[0_1px_0_0_rgba(223,255,0,0.05)] flex-shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link 
          href="/"
          className="font-display font-black text-xs tracking-[0.4em] text-white cursor-pointer"
        >
          DINKDASH<span className="text-volt">.XYZ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                isActive(item.href) ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="ml-4 p-2 text-ghost/40 hover:text-volt transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing ? "animate-spin text-volt" : "")} />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 text-ghost/40 active:text-volt transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing ? "animate-spin text-volt" : "")} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-volt p-2"
          >
            <Zap className={cn("w-5 h-5 transition-transform duration-300", isMobileMenuOpen ? "rotate-180" : "")} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-surface overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 text-left">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    isActive(item.href) ? "text-volt" : "text-ghost/40"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
