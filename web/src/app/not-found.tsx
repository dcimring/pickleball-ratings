import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="font-display italic text-6xl text-primary mb-2">404</p>
      <p className="text-foreground/60 mb-6 max-w-sm">
        We couldn&apos;t find that page. It may have been removed, or the link may be wrong.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-primary text-white rounded-full font-bold tracking-widest text-sm uppercase"
      >
        Back to Rankings
      </Link>
    </div>
  );
}
