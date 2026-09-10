import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Leaf, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";

import { seo } from "@/lib/seo";
import { business, cities } from "@/config/business";
import { frequencies, money, services, servicePrice } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/PageHero";
import { PricingGrid } from "@/components/site/PricingGrid";
import { CTABand } from "@/components/site/CTABand";
import { faqs } from "@/config/faqs";
import heroImage from "@/assets/hero-interior.jpg";
import linens from "@/assets/detail-linens.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Tranquility Level Cleaning — House Cleaning in Dallas–Fort Worth",
      description:
        "Come home to tranquility. Standard, deep, and move-in/move-out cleaning across Dallas–Fort Worth. Clear pricing from $145, recurring savings up to 20%.",
      path: "/",
    }),
  component: Home,
});

const whyPoints = [
  {
    icon: Leaf,
    title: "A calmer home, not just a cleaner one",
    body: "We clean with the feel of the room in mind — order, light, and surfaces that invite you to relax when you walk in.",
  },
  {
    icon: ShieldCheck,
    title: "Clear expectations, every visit",
    body: "You know what's included, what an add-on costs, and what we'll confirm with you before we start. No surprises at the door.",
  },
  {
    icon: Sparkles,
    title: "Detail where it actually shows",
    body: "Edges, trim, fixtures and the corners routine cleaning tends to pass over — the parts you notice long after we've gone.",
  },
  {
    icon: MessagesSquare,
    title: "Built around your space",
    body: "Pets, layout, delicate surfaces, product preferences and unusual scope are all discussed up front, not improvised.",
  },
];

const steps = [
  {
    step: "01",
    title: "Tell us about your home",
    body: "Choose your cleaning type and frequency, then share your scope, add-ons, and anything we should know.",
  },
  {
    step: "02",
    title: "We confirm the details",
    body: "We review your request and confirm scope, timing, and any adjustments before service is scheduled.",
  },
  {
    step: "03",
    title: "Come home to tranquility",
    body: "We clean thoughtfully and leave the home lighter, calmer, and easier to live in.",
  },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-sand">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Dallas–Fort Worth cleaning service</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.05] md:text-6xl">
              Come home to tranquility.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Professional cleaning designed to make your home feel lighter and easier to live in
              — thoughtful, consistent, and shaped around the way you actually use your space.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/booking">Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quote">Get a Custom Quote</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Standard cleans from{" "}
              <span className="font-semibold text-ink">{money(services[0].basePrice)}</span> for a
              standard average 1 bed / 1 bath home · Recurring savings up to 20%
            </p>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Sunlit living room corner with a linen chair, warm plaster wall and oak floor"
              width={1600}
              height={1200}
              className="aspect-4/3 w-full rounded-xl object-cover shadow-lift"
            />
            <div className="mt-4 rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft sm:absolute sm:-bottom-8 sm:left-6 sm:mt-0 sm:max-w-xs">
              <span className="font-semibold text-ink">Serving DFW</span> — Dallas, Fort Worth,
              Arlington, Plano and surrounding communities.
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Services"
            title="Cleaning shaped to the moment you're in"
            intro="Whether it's regular upkeep, a full reset, or a home in transition — each service has a defined scope and an approved starting price."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.id}
                to={service.route}
                className="group flex flex-col rounded-xl border border-border bg-card p-7 shadow-soft transition-colors hover:border-moss"
              >
                <h3 className="text-2xl">{service.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <p className="mt-6 text-sm font-semibold text-ink">
                  From {money(service.basePrice)}{" "}
                  <span className="font-normal text-muted-foreground">
                    · standard average 1 bed / 1 bath
                  </span>
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-moss">
                  Learn more{" "}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}

            <Link
              to="/commercial-cleaning"
              className="group flex flex-col rounded-xl border border-border bg-accent/50 p-7 shadow-soft transition-colors hover:border-moss"
            >
              <h3 className="text-2xl">Commercial / Office Cleaning</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Offices, suites and light commercial spaces. Always quoted after a consultation —
                never priced like a residential checkout.
              </p>
              <p className="mt-6 text-sm font-semibold text-ink">Custom quote</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-moss">
                Request a consultation{" "}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Tranquility"
            title="Considered work, start to finish"
            intro="Cleaning is a service you let into your home. We treat that access with care."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {whyPoints.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Icon className="size-5 text-moss" aria-hidden="true" />
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Three simple steps" />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.step}>
                <p className="font-display text-4xl text-moss-soft">{s.step}</p>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow="Pricing"
            title="Straightforward pricing, visible up front"
            intro="Base pricing reflects a standard average 1-bedroom, 1-full-bath home. Add only what your home actually needs."
          />
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>

      {/* Recurring savings */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Recurring service"
              title="Keep it going, and pay less each visit"
              intro="Recurring savings apply to the service price only — add-ons are always charged at their listed rate."
            />
            <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card shadow-soft">
              {frequencies.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt>
                    <span className="text-sm font-semibold text-ink">{f.name}</span>
                    <span className="ml-2 text-xs text-moss">{f.note}</span>
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    Standard clean{" "}
                    <span className="font-semibold text-ink">
                      {money(servicePrice("standard", f.id))}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src={linens}
            alt="Folded linen towels on a stone counter with a sprig of eucalyptus"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover shadow-soft"
          />
        </div>
      </section>

      {/* Virtual consultation */}
      <section className="section bg-accent/40">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">Virtual consultation</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Larger, unusual, or partial-home scope?</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Some homes shouldn't be priced by a calculator. Homes around 3,000 sq ft and larger,
              partial-home requests, specialty surfaces, and commercial spaces are all reviewed
              with you directly so the number you get is the number that fits.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild size="lg">
              <Link to="/quote">Request a consultation</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={business.phoneHref}>Call {business.phoneDisplay}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Service area */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Service area"
            title="Across Dallas–Fort Worth"
            intro="We serve the DFW metroplex and consider surrounding communities on request."
          />
          <ul className="mt-8 flex flex-wrap gap-2">
            {cities.map((city) => (
              <li
                key={city}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/80"
              >
                {city}
              </li>
            ))}
          </ul>
          <Link
            to="/service-area"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline"
          >
            See the full service area <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Questions" title="Good things to know" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {faqs.slice(0, 4).map((f) => (
              <div key={f.question}>
                <h3 className="flex items-start gap-2 text-lg">
                  <CalendarCheck className="mt-1 size-4 shrink-0 text-moss" aria-hidden="true" />
                  {f.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
          <Link
            to="/faq"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline"
          >
            Read all FAQs <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <CTABand />
    </>
  );
}
