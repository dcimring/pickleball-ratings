"use client";

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/** Shared rotating-star loading indicator. */
export function Spinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-40" role="status" aria-label="Loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
      </motion.div>
    </div>
  );
}
