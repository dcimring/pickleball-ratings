"use client";

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/site-config';

interface ShareButtonProps {
  name: string;
  /** Button copy; the status copy replaces it briefly after a copy */
  label?: string;
  className?: string;
}

/** Volt share button: native share sheet where available, clipboard fallback. */
export function ShareButton({ name, label = 'Share card', className }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = async () => {
    const shareData = {
      title: `${name} | ${SITE_NAME} rating`,
      text: `${SITE_NAME} profile: ${name}`,
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
      className={cn(
        'h-11 px-4 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all',
        className
      )}
    >
      {status === 'copied' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {status === 'copied' ? 'Link copied' : status === 'error' ? 'Copy failed' : label}
    </button>
  );
}
