"use client";

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  name: string;
}

export function ShareButton({ name }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = async () => {
    const shareData = {
      title: `${name} | DinkDash Rating`,
      text: `Check out ${name}'s latest pickleball stats and rankings on DinkDash!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('CLIPBOARD_ERROR:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="group flex items-center gap-2 py-1 px-0 border-b border-white/10 hover:border-volt transition-all duration-300"
    >
      <div className="relative">
        {status === 'copied' ? (
          <Check className="w-3 h-3 text-volt animate-in zoom-in duration-300" />
        ) : (
          <Share2 className="w-3 h-3 text-ghost/40 group-hover:text-volt transition-colors" />
        )}
      </div>
      <span className={cn(
        "font-display text-[10px] tracking-[0.2em] uppercase transition-colors",
        status === 'copied' ? "text-volt" : "text-ghost/40 group-hover:text-white"
      )}>
        {status === 'copied' ? 'LINK COPIED' : 'SHARE PROFILE'}
      </span>
    </button>
  );
}
