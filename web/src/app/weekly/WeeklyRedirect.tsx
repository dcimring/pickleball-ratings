'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Immediately forwards digest-link visitors to the Activity page. */
export function WeeklyRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(destination);
  }, [router, destination]);

  return null;
}
