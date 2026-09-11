import { Link } from "@tanstack/react-router";

export function Logo({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  return (
    <Link
      to="/"
      className={`group inline-flex min-w-0 items-center rounded-md ${hero ? "gap-4" : "gap-3"}`}
      aria-label="Tranquility Level Cleaning home"
    >
      <span
        aria-hidden="true"
        className={`relative flex shrink-0 items-center justify-center border border-gold/45 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--gold)_18%,transparent),color-mix(in_srgb,var(--night)_70%,transparent))] shadow-gold ${
          hero ? "size-14 rounded-2xl md:size-16" : "size-11 rounded-xl md:size-12"
        }`}
      >
        <svg viewBox="0 0 64 64" className={hero ? "size-12 md:size-[3.35rem]" : "size-9 md:size-10"} fill="none" aria-hidden="true">
          <path d="M12 18 32 6l20 12" stroke="currentColor" className="text-gold-soft" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31 15v34" stroke="currentColor" className="text-ink" strokeWidth="5" strokeLinecap="round" />
          <path d="M20 16h23" stroke="currentColor" className="text-ink" strokeWidth="5" strokeLinecap="round" />
          <path d="M18 45c8-13 17-18 29-19-3 13-10 22-23 27 5-7 9-14 12-22-6 5-11 10-18 14Z" fill="currentColor" className="text-moss" />
          <path d="M42 18h4v4h-4zM47 18h4v4h-4zM42 23h4v4h-4zM47 23h4v4h-4z" fill="currentColor" className="text-gold-soft" />
        </svg>
      </span>

      <span className="min-w-0 leading-none">
        <span className={`block truncate font-display font-semibold tracking-[-0.045em] text-ink ${hero ? "text-[1.72rem] md:text-[2.05rem]" : "text-[1.28rem] md:text-[1.48rem]"}`}>
          Tranquility
        </span>
        {!compact && (
          <>
            <span className="mt-1 flex items-center gap-2">
              <span className={hero ? "h-px w-6 bg-moss/80" : "h-px w-4 bg-moss/75"} aria-hidden="true" />
              <span className={`truncate font-bold uppercase text-muted-foreground ${hero ? "text-[0.63rem] tracking-[0.34em]" : "text-[0.58rem] tracking-[0.28em] md:text-[0.62rem]"}`}>
                Level Cleaning
              </span>
              <span className={hero ? "h-px w-6 bg-moss/80" : "h-px w-4 bg-moss/75"} aria-hidden="true" />
            </span>
            {hero && <span className="mt-2 block text-[0.5rem] font-semibold uppercase tracking-[0.28em] text-white/55">Clean Spaces. Calmer Days.</span>}
          </>
        )}
      </span>
    </Link>
  );
}
