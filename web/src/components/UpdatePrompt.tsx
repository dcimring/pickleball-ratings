"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

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
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[100] w-[92%] max-w-sm"
        >
          <div className="bg-secondary shadow-outline text-foreground p-3 pl-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="live-dot" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="font-display font-bold uppercase tracking-[0.12em] text-base leading-none">New board live</span>
                <span className="text-xs text-muted-foreground mt-1">Reload to see the latest version</span>
              </div>
            </div>
            <button
              onClick={handleReload}
              className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-display font-bold text-[13px] uppercase tracking-[0.14em] flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
