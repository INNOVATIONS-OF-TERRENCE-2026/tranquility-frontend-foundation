import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Home as HomeIcon,
  Layers3,
  MapPin,
  PackageOpen,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { uploadedBrandHero, uploadedBrandLight, uploadedStudioConcept } from "@/assets/uploadedImages";
import { Button } from "@/components/ui/button";
import { CTABand } from "@/components/site/CTABand";
import { PricingGrid } from "@/components/site/PricingGrid";
import { SectionHeading } from "@/components/site/PageHero";
import { business, cities } from "@/config/business";
import { faqs } from "@/config/faqs";
import { frequencies, money, services, servicePrice } from "@/config/pricing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Tranquility Level Cleaning | House Cleaning in Dallas-Fort Worth",
      description:
        "Come home to tranquility. Standard, deep, and move-in/move-out cleaning across Dallas-Fort Worth with clear pricing from $145 and recurring savings up to 20%.",
      path: "/",
    }),
  component: Home,
});

const serviceRail = [
  { icon: HomeIcon, label: "Residential", note: "Routine home care", to: "/residential-cleaning" as const },
  { icon: Sparkles, label: "Deep Clean", note: "Detailed reset", to: "/deep-cleaning" as const },
  { icon: PackageOpen, label: "Move-In / Move-Out", note: "Fresh transitions", to: "/move-in-move-out-cleaning" as const },
  { icon: Building2, label: "Commercial", note: "Custom consultation", to: "/commercial-cleaning" as const },
];

const experiencePoints = [
  {
    icon: ShieldCheck,
    title: "Clear before we clean",
    body: "Service type, recurring savings, add-ons, and custom-review conditions stay visible before you send a request.",
  },
  {
    icon: SlidersHorizontal,
    title: "Built around your actual space",
    body: "Room quantities, pets, surface notes, protected areas, and specialty details can be organized without hiding the scope.",
  },
  {
    icon: Layers3,
    title: "Custom when it should be",
    body: "Large, partial-home, specialty, and commercial requests can move into consultation instead of being forced through standard pricing.",
  },
];

function Home() {
  return (
    <>
      <section className="brand-dark relative overflow-hidden border-b border-gold/20 bg-background">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 26%), radial-gradient(circle at 8% 86%, color-mix(in srgb, var(--moss) 18%, transparent), transparent 30%)",
          }}
          aria-hidden="true"
        />
        <div className="container-page relative py-7 md:py-10 lg:py-12">
          <div className="mb-5 flex flex-col gap-3 border-b border-gold/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Premium cleaning services across Dallas - Fort Worth</p>
              <h1 className="mt-2 max-w-4xl text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
                The Tranquility experience, exactly where home should feel its best.
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Clear pricing, serious customization, and a visual service experience built around the way the home is actually used.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-night shadow-lift">
            <img
              src={uploadedBrandHero}
              alt="Tranquility Level Cleaning navy and gold Dallas brand concept with a luxury living room and cleaning service navigation"
              className="aspect-[5/2] w-full object-cover object-center"
              fetchPriority="high"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" aria-hidden="true" />
          </div>

          <div className="relative z-10 mx-auto -mt-3 grid max-w-6xl gap-3 rounded-3xl border border-gold/25 bg-card/95 p-4 shadow-lift backdrop-blur-xl md:-mt-8 md:grid-cols-[1fr_auto] md:items-center md:p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span><strong className="font-semibold text-ink">Standard from {money(services[0].basePrice)}</strong> for an average 1 bed / 1 bath home</span>
              <span>Recurring savings up to 20%</span>
              <span>Custom scope reviewed directly</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg"><Link to="/booking">Request Service <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/studio">Open TLC Studio</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-dark border-b border-gold/20 bg-night">
        <div className="container-page grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {serviceRail.map(({ icon: Icon, label, note, to }) => (
            <Link key={label} to={to} className="group flex min-h-32 items-center gap-4 px-3 py-6 sm:px-5 lg:min-h-36">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-moss transition group-hover:-translate-y-0.5 group-hover:bg-gold/10">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.15em] text-ink">{label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
            <img
              src={uploadedBrandLight}
              alt="Tranquility Level Cleaning light brand concept with a warm neutral interior and service categories"
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="eyebrow">More than clean</p>
            <h2 className="mt-3 text-4xl leading-tight md:text-5xl">A visual standard that feels like the brand, not a stock cleaning template.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              The landing experience now uses the Tranquility artwork itself as the visual language. The live interface around it carries the same premium hierarchy while keeping pricing, service details, and customer actions fully functional.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/services">Explore Services</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/quote">Get a Custom Quote</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow="Service experience"
            title="Powerful enough to customize. Simple enough to use."
            intro="Every major decision stays understandable, from base pricing and room scope to special conditions that deserve direct review."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {experiencePoints.map(({ icon: Icon, title, body }) => (
              <article key={title} className="group rounded-3xl border border-border bg-card p-7 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-gold/45 hover:shadow-lift">
                <span className="flex size-12 items-center justify-center rounded-full border border-gold/25 bg-accent/45 text-moss"><Icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Approved pricing"
            title="See the starting point before you request service."
            intro="Base pricing reflects a standard average 1-bedroom, 1-full-bath home. Approved room charges and add-ons remain separate and visible."
          />
          <div className="mt-10"><PricingGrid /></div>
        </div>
      </section>

      <section className="brand-dark section relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: "radial-gradient(circle at 90% 20%, color-mix(in srgb, var(--gold) 18%, transparent), transparent 30%)" }}
          aria-hidden="true"
        />
        <div className="container-page relative grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold-soft">
              <Sparkles className="size-3.5" aria-hidden="true" /> TLC Studio
            </div>
            <h2 className="mt-5 text-4xl leading-tight text-ink md:text-6xl">Your home. Your priorities. One intelligent workspace.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Start with a quick setup or go room by room. TLC Studio organizes cleaning type, frequency, spaces, priorities, surfaces, household needs, protected areas, approved add-ons, and your Home Care Blueprint.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/studio">Launch TLC Studio</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-gold/35"><Link to="/booking">Request Service</Link></Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gold/25 bg-night shadow-lift">
            <img
              src={uploadedStudioConcept}
              alt="TLC Studio concept showing a premium room and service customization workspace"
              className="aspect-[3/2] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Recurring service"
              title="A cleaner rhythm, with savings built in."
              intro="Recurring savings apply to the service price only. Add-ons remain at their approved listed rate."
            />
            <Button asChild variant="outline" className="mt-6"><Link to="/booking">Build a recurring request</Link></Button>
          </div>
          <dl className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
            {frequencies.map((frequency) => (
              <div key={frequency.id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 last:border-b-0 sm:px-6">
                <dt>
                  <span className="text-sm font-semibold text-ink">{frequency.name}</span>
                  <span className="ml-2 text-xs font-semibold text-moss">{frequency.note}</span>
                </dt>
                <dd className="text-sm text-muted-foreground">Standard <span className="font-semibold tabular-nums text-ink">{money(servicePrice("standard", frequency.id))}</span></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 rounded-[2rem] border border-border bg-card p-7 shadow-lift md:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow">Virtual consultation</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Large, unusual, or partial-home scope?</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Homes around 3,000 sq ft and larger, partial-home requests, specialty surfaces, and commercial spaces are reviewed directly so the quote reflects the actual work involved.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild size="lg"><Link to="/quote">Request a consultation</Link></Button>
            <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <SectionHeading eyebrow="Service area" title="Across Dallas - Fort Worth" intro="Euless is now included in the listed core service communities. Use the interactive map to search cities and explore nearby listed locations by mileage radius." />
            <Button asChild className="mt-6"><Link to="/service-area">Explore the Interactive Map</Link></Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cities.slice(0, 12).map((city) => (
              <li key={city} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-soft"><MapPin className="size-4 text-moss" aria-hidden="true" />{city}</li>
            ))}
            <li className="flex min-h-14 items-center gap-3 rounded-2xl border border-gold/35 bg-accent/35 px-4 text-sm font-semibold text-ink shadow-soft"><MapPin className="size-4 text-moss" aria-hidden="true" />Euless</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Questions" title="Good things to know before service." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {faqs.slice(0, 4).map((faq) => (
              <article key={faq.question} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h3 className="flex items-start gap-2 text-lg"><CalendarCheck className="mt-1 size-4 shrink-0 text-moss" aria-hidden="true" />{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
          <Link to="/faq" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">Read all FAQs <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <CTABand title="Ready to build your Tranquility plan?" intro="Request service directly or use TLC Studio to organize your space first." />
    </>
  );
}
