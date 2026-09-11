import { Link } from "@tanstack/react-router";

export function Logo({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none"
      aria-label="Tranquility Level Cleaning home"
    >
      <span
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_12px_36px_-18px_rgba(0,0,0,0.75)] ${
          hero ? "size-14 md:size-16" : "size-11 md:size-12"
        }`}
      >
        <img
          src="/tranquility-official-logo.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          decoding="async"
        />
      </span>

      {!compact && (
        <span className="hidden min-w-0 sm:block">
          <span className={`block truncate font-display font-semibold tracking-[-0.035em] text-ink ${hero ? "text-[1.55rem] md:text-[1.9rem]" : "text-[1.2rem] md:text-[1.4rem]"}`}>
            Tranquility
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-gold/70" aria-hidden="true" />
            <span className="truncate text-[0.56rem] font-bold uppercase tracking-[0.24em] text-muted-foreground md:text-[0.6rem]">
              Level Cleaning
            </span>
            <span className="h-px w-4 bg-gold/70" aria-hidden="true" />
          </span>
        </span>
      )}
    </Link>
  );
}
