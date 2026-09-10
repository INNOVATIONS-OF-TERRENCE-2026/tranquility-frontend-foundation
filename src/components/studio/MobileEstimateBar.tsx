import { AlertTriangle, ChevronUp } from "lucide-react";
import { useState } from "react";

import { money } from "@/config/pricing";
import { buildStudioEstimate, studioReviewFlags } from "@/lib/studio";
import type { StudioState } from "@/types/studio";

export function MobileEstimateBar({ state }: { state: StudioState }) {
  const [open, setOpen] = useState(false);
  const estimate = buildStudioEstimate(state);
  const reviewFlags = studioReviewFlags(state);

  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
      <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lift backdrop-blur-xl">
        {open && (
          <div id="mobile-studio-estimate" className="border-b border-border p-4">
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{estimate.service.name}</dt>
                <dd className="font-semibold tabular-nums text-ink">{money(estimate.basePrice)}</dd>
              </div>
              {estimate.discountAmount > 0 && (
                <div className="flex justify-between gap-4 text-moss">
                  <dt>{estimate.frequency.name} savings</dt>
                  <dd className="font-semibold tabular-nums">-{money(estimate.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Room charges and add-ons</dt>
                <dd className="font-semibold tabular-nums text-ink">{money(estimate.addOnTotal)}</dd>
              </div>
            </dl>
            {reviewFlags.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-sand p-3 text-xs leading-relaxed text-oak">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {reviewFlags.length} review {reviewFlags.length === 1 ? "item" : "items"} identified.
                </span>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-studio-estimate"
          className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-moss">
              Live estimate
            </span>
            <span className="mt-0.5 block font-display text-2xl text-ink">{money(estimate.total)}</span>
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {open ? "Hide details" : "Show details"}
            <ChevronUp
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
    </div>
  );
}
