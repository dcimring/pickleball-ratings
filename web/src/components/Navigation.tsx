"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, RefreshCw } from 'lucide-react';
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
    <nav className="fixed top-0 z-[100] w-full h-16 md:h-20 bg-background/80 backdrop-blur-md border-b border-border/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-200">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link 
          href="/"
          className="font-display font-bold text-lg tracking-tight text-foreground cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-primary-foreground font-black text-sm leading-none pt-0.5">D</span>
          </div>
          DINKDASH<span className="text-primary">.XYZ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="ml-4 p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing ? "animate-spin text-primary" : "")} />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 text-muted-foreground active:text-primary transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing ? "animate-spin text-primary" : "")} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-primary p-2 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-background border-b border-border/10 md:hidden z-40"
          >
            <div className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium py-2",
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border/10 flex flex-col gap-3">
                <button className="w-full py-3 px-4 rounded-lg border border-border/10 text-foreground font-medium text-sm hover:bg-secondary transition-colors">
                  Log In
                </button>
                <button className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                  Join Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
