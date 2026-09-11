import { Minus, Plus } from "lucide-react";

interface QuantityFieldProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  hint?: string;
  price?: string;
}

export function QuantityField({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  hint,
  price,
}: QuantityFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/80 px-4 py-3.5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {price && <p className="mt-0.5 text-xs font-semibold text-moss">{price}</p>}
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/20 bg-background/60 p-1">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink transition-colors hover:border-gold/45 hover:text-moss disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="w-9 text-center text-sm font-bold tabular-nums text-ink" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-full border border-gold/35 bg-primary text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
