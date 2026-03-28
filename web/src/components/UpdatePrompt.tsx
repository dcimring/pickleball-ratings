"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Star } from 'lucide-react';

export function UpdatePrompt() {
  const [initialBuildId, setInitialBuildId] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkVersion = useCallback(async (isInitial = false) => {
    try {
      // Add a timestamp to bypass cache
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const currentBuildId = data.buildId;

      if (isInitial) {
        setInitialBuildId(currentBuildId);
      } else if (initialBuildId && currentBuildId !== initialBuildId) {
        setUpdateAvailable(true);
      }
    } catch (err) {
      // Silently fail version checks
      console.debug('Version check failed:', err);
    }
  }, [initialBuildId]);

  useEffect(() => {
    // Initial check on mount
    checkVersion(true);

    // Poll every 10 minutes
    const intervalId = setInterval(() => checkVersion(), 10 * 60 * 1000);

    // Check on window focus
    const handleFocus = () => checkVersion();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkVersion]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          className="fixed bottom-12 left-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="bg-primary text-secondary p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,75,36,0.3)] flex items-center justify-between gap-6 overflow-hidden relative">
            {/* Editorial Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/4 -z-10" />
            
            <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-2.5 rounded-xl">
                <Star className="w-5 h-5 fill-secondary text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display italic text-lg tracking-tighter leading-none mb-1">Update Ready</span>
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest font-sans">New Edition Live</span>
              </div>
            </div>
            
            <button
              onClick={handleReload}
              className="flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-xl font-sans font-bold text-[10px] tracking-[0.2em] uppercase hover:opacity-95 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Reload
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
