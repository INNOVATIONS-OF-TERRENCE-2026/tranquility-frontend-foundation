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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {price && <p className="text-xs text-moss">{price}</p>}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-ink disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-ink disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
