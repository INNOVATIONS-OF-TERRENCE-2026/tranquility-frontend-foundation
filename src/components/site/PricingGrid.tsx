import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import {
  PRICING_DISCLOSURE,
  frequencies,
  money,
  services,
  servicePrice,
  type ServiceId,
} from "@/config/pricing";
import { Button } from "@/components/ui/button";

export function PricingGrid({ highlight }: { highlight?: ServiceId }) {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {services.map((service, index) => {
          const isHighlight = highlight === service.id;
          return (
            <article
              key={service.id}
              className={`relative flex min-h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift ${
                isHighlight ? "border-gold" : "border-border"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-px gold-rule" aria-hidden="true" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-moss">0{index + 1}</p>
                  <h3 className="mt-2 text-2xl">{service.name}</h3>
                </div>
                <span className="rounded-full border border-gold/25 bg-accent/45 px-3 py-1 text-xs font-semibold text-accent-foreground">Starting price</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Standard average 1 bed / 1 full bath home
              </p>
              <p className="mt-7 font-display text-5xl text-ink">{money(service.basePrice)}</p>
              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.17em] text-muted-foreground">
                One-time base price
              </p>

              <dl className="mt-7 space-y-3 border-t border-border pt-5 text-sm">
                {frequencies
                  .filter((frequency) => frequency.id !== "onetime")
                  .map((frequency) => (
                    <div key={frequency.id} className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {frequency.name}{" "}
                        <span className="text-xs font-semibold text-moss">{frequency.note}</span>
                      </dt>
                      <dd className="font-semibold tabular-nums text-ink">
                        {money(servicePrice(service.id, frequency.id))}
                      </dd>
                    </div>
                  ))}
              </dl>

              <div className="mt-7 flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link to="/booking" search={{ service: service.id }}>
                    Request this service <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to={service.route}>See what is included</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/45 px-5 py-4">
        <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
          {PRICING_DISCLOSURE} Recurring savings apply to the service price only, not to add-ons.
        </p>
      </div>
    </div>
  );
}
