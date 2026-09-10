import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { PRICING_DISCLOSURE, money } from "@/config/pricing";
import { buildStudioEstimate, preferenceCompletion, studioReviewFlags } from "@/lib/studio";
import type { StudioState } from "@/types/studio";

export function EstimatePanel({ state }: { state: StudioState }) {
  const estimate = buildStudioEstimate(state);
  const reviewFlags = studioReviewFlags(state);
  const completion = preferenceCompletion(state);

  return (
    <aside className="rounded-2xl border border-border bg-card p-5 shadow-lift lg:sticky lg:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Live estimate</p>
          <p className="mt-2 font-display text-4xl text-ink">{money(estimate.total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Estimated total per visit</p>
        </div>
        <div className="rounded-full border border-border bg-sand px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {completion}% profile
        </div>
      </div>

      <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{estimate.service.name}</dt>
          <dd className="font-semibold tabular-nums text-ink">{money(estimate.basePrice)}</dd>
        </div>
        {estimate.discountAmount > 0 && (
          <div className="flex items-center justify-between gap-4 text-moss">
            <dt>{estimate.frequency.name} savings</dt>
            <dd className="font-semibold tabular-nums">-{money(estimate.discountAmount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Approved room charges and add-ons</dt>
          <dd className="font-semibold tabular-nums text-ink">{money(estimate.addOnTotal)}</dd>
        </div>
      </dl>

      {estimate.addOnLines.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-ink">Priced selections</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {estimate.addOnLines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span>
                  {line.label} x {line.qty}
                  {line.startingAt ? " (starting at)" : ""}
                </span>
                <span className="font-semibold tabular-nums text-ink">{money(line.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-sand p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-ink">Preference Profile Completion</span>
          <span className="text-xs font-semibold text-moss">{completion}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-soft" aria-hidden="true">
          <div className="h-full rounded-full bg-moss transition-[width] duration-300" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {reviewFlags.length ? (
            <AlertTriangle className="size-4 text-oak" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4 text-moss" aria-hidden="true" />
          )}
          Items requiring review
        </h3>
        {reviewFlags.length ? (
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
            {reviewFlags.map((flag) => (
              <li key={flag}>• {flag}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            No additional Studio review flags are currently identified.
          </p>
        )}
      </div>

      <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
        {PRICING_DISCLOSURE}
      </p>
    </aside>
  );
}
