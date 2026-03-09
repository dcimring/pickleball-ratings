"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';

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
          className="fixed bottom-8 left-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/10 p-2 rounded-xl">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xs tracking-widest uppercase leading-none mb-1">Update Ready</span>
                <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider">New version available</span>
              </div>
            </div>
            
            <button
              onClick={handleReload}
              className="flex items-center gap-2 bg-primary-foreground text-primary px-4 py-2.5 rounded-xl font-display font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all active:scale-95 shadow-sm"
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
