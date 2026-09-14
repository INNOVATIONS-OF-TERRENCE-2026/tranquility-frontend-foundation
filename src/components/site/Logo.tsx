import { Link } from "@tanstack/react-router";

import { brandAssets } from "@/config/brand";

export function Logo({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Tranquility Level Cleaning home"
    >
      <span
        className={`relative shrink-0 ${
          hero ? "h-14 w-[4.7rem] md:h-16 md:w-[5.35rem]" : "h-11 w-[3.7rem] md:h-12 md:w-16"
        }`}
      >
        <img
          src={brandAssets.logo}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain drop-shadow-[0_7px_10px_rgba(0,0,0,0.35)]"
          width={1448}
          height={1086}
          decoding="async"
        />
      </span>

      {!compact && (
        <span className="hidden min-w-0 sm:block">
          <span
            className={`block truncate font-display font-semibold tracking-[-0.035em] text-ink ${hero ? "text-[1.55rem] md:text-[1.9rem]" : "text-[1.2rem] md:text-[1.4rem]"}`}
          >
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
