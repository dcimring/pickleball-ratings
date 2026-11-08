"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Find the scrollable container from layout.tsx
    const container = document.querySelector('.overflow-y-auto');
    if (!container) return;

    const toggleVisibility = () => {
      setIsVisible(container.scrollTop > 400);
    };

    container.addEventListener('scroll', toggleVisibility);
    return () => container.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 md:right-8 z-[100] w-12 h-12 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-glow hover:opacity-90 active:scale-95 transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
