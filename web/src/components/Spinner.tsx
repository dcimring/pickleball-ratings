"use client";

import { motion } from 'framer-motion';

/** Shared loading indicator: three Volt bars pulsing like a live ticker. */
export function Spinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32" role="status" aria-label="Loading">
      <div className="flex items-end gap-1.5 h-8">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 bg-primary rounded-sm"
            initial={{ height: 8, opacity: 0.4 }}
            animate={{ height: [8, 32, 8], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="kicker text-xs">Loading board</span>
    </div>
  );
}
