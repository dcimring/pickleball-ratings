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
      if (container.scrollTop > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener('scroll', toggleVisibility);
    return () => container.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-transform"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 stroke-[3px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
