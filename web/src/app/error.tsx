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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="font-display italic text-3xl text-primary mb-2">Something went wrong</p>
      <p className="text-foreground/60 mb-6 max-w-sm">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-primary text-white rounded-full font-bold tracking-widest text-sm uppercase"
      >
        Try Again
      </button>
    </div>
  );
}
