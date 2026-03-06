"use client";

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
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
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="relative inline-flex items-center group">
      <button
        onClick={handleShare}
        className={cn(
          "relative flex items-center gap-3 px-4 py-2 transition-all duration-300",
          "bg-surface border border-white/10 rounded-lg overflow-hidden",
          "hover:border-volt/50 hover:shadow-[0_0_20px_-5px_rgba(223,255,0,0.3)]",
          "active:scale-95"
        )}
      >
        {/* Background Accent */}
        <div className="absolute inset-0 bg-volt/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Animated Icon */}
        <div className="relative">
          {status === 'copied' ? (
            <Check className="w-4 h-4 text-volt animate-in zoom-in duration-300" />
          ) : (
            <Share2 className="w-4 h-4 text-ghost/40 group-hover:text-volt transition-colors" />
          )}
        </div>

        {/* Text */}
        <span className="relative font-display text-[10px] tracking-[0.2em] text-ghost/40 group-hover:text-white uppercase transition-colors">
          {status === 'copied' ? 'TRANSMITTED' : 'TRANSMIT'}
        </span>

        {/* Geometric Corner Detail */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-volt transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-volt transition-colors" />
      </button>

      {/* Floating Feedback Toast */}
      {status === 'copied' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-volt text-background rounded-full whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="font-display text-[10px] font-black tracking-widest uppercase">
            LINK COPIED TO CLIPBOARD
          </span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-volt rotate-45" />
        </div>
      )}
    </div>
  );
}
