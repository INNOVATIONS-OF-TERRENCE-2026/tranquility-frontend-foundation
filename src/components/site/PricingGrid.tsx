import { Link } from "@tanstack/react-router";

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
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => {
          const isHighlight = highlight === service.id;
          return (
            <article
              key={service.id}
              className={`flex flex-col rounded-xl border bg-card p-6 shadow-soft ${
                isHighlight ? "border-moss" : "border-border"
              }`}
            >
              <h3 className="text-xl">{service.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Standard average 1 bed / 1 full bath home
              </p>
              <p className="mt-5 font-display text-4xl text-ink">{money(service.basePrice)}</p>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                One-time base price
              </p>

              <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
                {frequencies
                  .filter((f) => f.id !== "onetime")
                  .map((f) => (
                    <div key={f.id} className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {f.name}{" "}
                        <span className="text-xs text-moss">({f.note})</span>
                      </dt>
                      <dd className="font-semibold text-ink">
                        {money(servicePrice(service.id, f.id))}
                      </dd>
                    </div>
                  ))}
              </dl>

              <div className="mt-6 flex flex-col gap-2">
                <Button asChild>
                  <Link to="/booking" search={{ service: service.id }}>
                    Request this service
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to={service.route}>What's included</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {PRICING_DISCLOSURE} Recurring savings apply to the service price only, not to add-ons.
      </p>
    </div>
  );
}
