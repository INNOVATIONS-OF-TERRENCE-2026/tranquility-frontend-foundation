import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3 rounded-sm"
      aria-label="Tranquility Level Cleaning — home"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full border border-moss/30 bg-accent/60"
      >
        <svg viewBox="0 0 24 24" className="size-5 text-moss" fill="none" aria-hidden="true">
          <path
            d="M12 3.5c3.6 2.6 5.6 5.5 5.6 8.6A5.6 5.6 0 0 1 12 17.7a5.6 5.6 0 0 1-5.6-5.6c0-3.1 2-6 5.6-8.6Z"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <path d="M12 20.5v-8.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[1.05rem] tracking-tight text-ink">
          Tranquility
        </span>
        {!compact && (
          <span className="block text-[0.62rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Level Cleaning
          </span>
        )}
      </span>
    </Link>
  );
}
