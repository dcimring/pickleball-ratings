"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ROUTE_ERROR:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-3">
      <span className="kicker text-[13px] text-destructive">Error</span>
      <p className="font-display font-extrabold uppercase text-3xl md:text-4xl text-foreground">Something went wrong</p>
      <p className="text-muted-foreground max-w-sm">We couldn&apos;t load this page. Please try again.</p>
      <button
        onClick={reset}
        className="mt-3 h-11 px-5 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-[0.14em]"
      >
        Try again
      </button>
    </div>
  );
}
