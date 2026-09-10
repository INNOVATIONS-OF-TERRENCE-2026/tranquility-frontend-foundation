import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link to="/booking" search={{ service: service.id }}>Request this service</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/studio">Customize in Studio</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/quote">Get a custom quote</Link></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading title="What this service covers" intro={service.description} />
            <ul className="mt-8 space-y-3">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />{item}
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-xl">Best suited for</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {bestFor.map((item) => <li key={item}>• {item}</li>)}
            </ul>

            {notes && <p className="mt-8 border-l-2 border-moss bg-sand/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{notes}</p>}

            <div className="mt-10 border-t border-border pt-8">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
                <div>
                  <h3 className="text-2xl">Want to map the home first?</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Tranquility Studio lets you organize rooms, cleaning priorities, surfaces, product preferences, and protected areas before you send a service request.
                  </p>
                  <Link to="/studio" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-moss hover:underline">Open Tranquility Studio</Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <p className="eyebrow">Pricing</p>
            <p className="mt-3 font-display text-4xl text-ink">{money(service.basePrice)}</p>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">One-time, standard average 1 bed / 1 bath home</p>
            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                <div key={frequency.id} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{frequency.name} <span className="text-xs text-moss">({frequency.note})</span></dt>
                  <dd className="font-semibold text-ink">{money(servicePrice(service.id, frequency.id))}</dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-6 w-full"><Link to="/booking" search={{ service: service.id }}>Build my estimate</Link></Button>
            <Button asChild variant="secondary" className="mt-2 w-full"><Link to="/studio">Open Studio</Link></Button>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{PRICING_DISCLOSURE}</p>
            <img src={roomLight} alt="Sunlit room with light oak flooring and clean baseboards" width={1408} height={1008} loading="lazy" className="mt-6 hidden rounded-lg object-cover lg:block" />
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
