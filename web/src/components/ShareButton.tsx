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
      text: `DinkDash Profile: ${name}`,
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
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw new Error('Fallback copy failed');
        }
      }
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
      className="group flex items-center gap-2 py-2 px-0 border-b border-secondary/10 hover:border-secondary transition-all duration-300"
    >
      <div className="relative">
        {status === 'copied' ? (
          <Check className="w-3.5 h-3.5 text-secondary animate-in zoom-in duration-300" />
        ) : (
          <Share2 className="w-3.5 h-3.5 text-secondary/40 group-hover:text-secondary transition-colors" />
        )}
      </div>
      <span className={cn(
        "font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
        status === 'copied' ? "text-secondary" : "text-secondary/60 group-hover:text-secondary"
      )}>
        {status === 'copied' ? 'Link Copied' : 'Share Profile'}
      </span>
    </button>
  );
}
