import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-3">
      <p className="numeral text-[120px] text-muted-foreground">404</p>
      <p className="font-display font-extrabold uppercase text-3xl text-foreground">Not on the board</p>
      <p className="text-muted-foreground max-w-sm">
        We couldn&apos;t find that page. It may have been removed, or the link may be wrong.
      </p>
      <Link
        href="/"
        className="mt-3 h-11 px-5 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-[0.14em] inline-flex items-center"
      >
        Back to rankings
      </Link>
    </div>
  );
}
