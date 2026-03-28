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
    { label: 'Rankings', href: '/' },
    { label: 'Activity', href: '/activity' },
    { label: 'Alerts', href: '/alerts' },
    { label: 'Tourney Check', href: '/tourney' },
    { label: 'Suggest Feature', href: '/suggest' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 z-[100] w-full h-16 md:h-20 bg-secondary/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-200">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link 
          href="/"
          className="font-display text-xl tracking-tight text-foreground cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="text-secondary font-display text-lg leading-none pt-0.5 italic">D</span>
          </div>
          DinkDash<span className="text-primary italic">.xyz</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xl font-display italic transition-colors duration-200",
                isActive(item.href) ? "text-primary" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="ml-4 p-2 text-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
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
            className="p-2 text-foreground/40 active:text-primary transition-colors"
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
            className="absolute top-16 left-0 w-full bg-secondary backdrop-blur-xl md:hidden z-40"
          >
            <div className="flex flex-col p-8 gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-2xl font-display italic",
                    isActive(item.href) ? "text-primary" : "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-8 mt-4 bg-muted/50 rounded-2xl flex flex-col gap-3 p-6">
                <button className="w-full py-4 px-4 bg-background text-foreground font-medium text-sm transition-colors rounded-lg">
                  Log In
                </button>
                <button className="w-full py-4 px-4 bg-primary text-secondary font-medium text-sm hover:opacity-90 transition-opacity rounded-lg shadow-lg shadow-primary/10">
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
