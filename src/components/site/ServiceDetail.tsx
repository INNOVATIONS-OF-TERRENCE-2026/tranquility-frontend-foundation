import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PageHero, SectionHeading } from "./PageHero";
import { CTABand } from "./CTABand";
import { Button } from "@/components/ui/button";
import {
  PRICING_DISCLOSURE,
  frequencies,
  getService,
  money,
  servicePrice,
  type ServiceId,
} from "@/config/pricing";
import roomLight from "@/assets/room-light.jpg";

interface ServiceDetailProps {
  serviceId: ServiceId;
  eyebrow: string;
  intro: string;
  bestFor: string[];
  notes?: string;
}

export function ServiceDetail({ serviceId, eyebrow, intro, bestFor, notes }: ServiceDetailProps) {
  const service = getService(serviceId);

  return (
    <>
      <PageHero eyebrow={eyebrow} title={service.name} intro={intro}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/booking" search={{ service: service.id }}>Request this service</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/quote">Get a custom quote</Link>
          </Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading title="What this service covers" intro={service.description} />
            <ul className="mt-8 space-y-3">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-xl">Best suited for</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {bestFor.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {notes && (
              <p className="mt-8 rounded-lg border border-border bg-muted p-5 text-sm leading-relaxed text-muted-foreground">{notes}</p>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <p className="eyebrow">Pricing</p>
            <p className="mt-3 font-display text-4xl text-ink">{money(service.basePrice)}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              One-time, standard average 1 bed / 1 bath home
            </p>
            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {frequencies.filter((item) => item.id !== "onetime").map((item) => (
                <div key={item.id} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {item.name} <span className="text-xs text-moss">({item.note})</span>
                  </dt>
                  <dd className="font-semibold text-ink">{money(servicePrice(service.id, item.id))}</dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-6 w-full">
              <Link to="/booking" search={{ service: service.id }}>Build my estimate</Link>
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{PRICING_DISCLOSURE}</p>
            <img
              src={roomLight}
              alt="Sunlit room with light oak flooring and clean baseboards"
              width={1408}
              height={1008}
              loading="lazy"
              className="mt-6 hidden rounded-lg object-cover lg:block"
            />
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
