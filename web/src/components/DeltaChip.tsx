import { cn } from '@/lib/utils';

interface DeltaChipProps {
  /** Rating change. `undefined` = unknown (history not loaded); 0 = unchanged. */
  value?: number;
  /** Decimal places; ratings use 3, ranks use 0 */
  digits?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Volt-up / coral-down movement chip in condensed numerals. */
export function DeltaChip({ value, digits = 3, size = 'sm', className }: DeltaChipProps) {
  const sizeClass = size === 'lg' ? 'text-[22px] px-2.5 py-1' : size === 'md' ? 'text-base px-2 py-0.5' : 'text-sm px-1.5 py-0.5';

  if (value === undefined || value === 0) {
    return (
      <span className={cn('font-display font-bold text-muted-foreground tabular-nums', sizeClass, className)} aria-label={value === 0 ? 'No change' : 'No previous rating'}>
        —
      </span>
    );
  }

  const up = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-display font-bold tabular-nums tracking-[0.04em]',
        sizeClass,
        up ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10',
        className
      )}
    >
      {up ? '▲' : '▼'}&nbsp;{Math.abs(value).toFixed(digits)}
    </span>
  );
}
