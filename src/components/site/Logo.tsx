import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex min-w-0 items-center gap-3 rounded-md"
      aria-label="Tranquility Level Cleaning home"
    >
      <span
        aria-hidden="true"
        className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(215,182,111,0.04))] shadow-gold md:size-12"
      >
        <svg viewBox="0 0 64 64" className="size-9 md:size-10" fill="none" aria-hidden="true">
          <path
            d="M12 18 32 6l20 12"
            stroke="currentColor"
            className="text-moss"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M31 15v34" stroke="currentColor" className="text-ink" strokeWidth="5" strokeLinecap="round" />
          <path d="M20 16h23" stroke="currentColor" className="text-ink" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M18 45c8-13 17-18 29-19-3 13-10 22-23 27 5-7 9-14 12-22-6 5-11 10-18 14Z"
            fill="currentColor"
            className="text-moss"
          />
          <path d="M42 18h4v4h-4zM47 18h4v4h-4zM42 23h4v4h-4zM47 23h4v4h-4z" fill="currentColor" className="text-moss-soft" />
        </svg>
      </span>

      <span className="min-w-0 leading-none">
        <span className="block truncate font-display text-[1.28rem] font-semibold tracking-[-0.035em] text-ink md:text-[1.48rem]">
          Tranquility
        </span>
        {!compact && (
          <span className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-moss/75" aria-hidden="true" />
            <span className="truncate text-[0.58rem] font-bold uppercase tracking-[0.28em] text-muted-foreground md:text-[0.62rem]">
              Level Cleaning
            </span>
            <span className="h-px w-4 bg-moss/75" aria-hidden="true" />
          </span>
        )}
      </span>
    </Link>
  );
}
