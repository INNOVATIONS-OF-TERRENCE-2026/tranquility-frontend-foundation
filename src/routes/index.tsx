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

const studioCards = [
  "Room planning",
  "Cleaning priorities",
  "Style and palette profile",
  "Surface awareness",
  "Protected areas",
  "Home Care Blueprint",
];

function Home() {
  return (
    <>
      <section className="brand-dark relative overflow-hidden border-b border-gold/20 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(226,194,122,0.18),transparent_25%),radial-gradient(circle_at_0%_90%,rgba(255,255,255,0.05),transparent_28%)]" aria-hidden="true" />
        <div className="container-page relative grid min-h-[42rem] gap-10 py-12 md:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-0 lg:py-0">
          <div className="relative z-10 py-5 lg:pr-12">
            <p className="eyebrow">Professional cleaning across Dallas - Fort Worth</p>
            <h1 className="mt-5 max-w-3xl text-[3.25rem] leading-[0.94] text-ink sm:text-6xl md:text-7xl lg:text-[5.7rem]">
              A cleaner space.
              <span className="gold-text block">A brighter you.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Thoughtful home cleaning with visible pricing, flexible customization, and a service experience designed around how your space is actually lived in.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link to="/booking">Request Service <ArrowRight className="size-4" aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold/35 text-foreground hover:bg-gold/10 hover:text-gold-soft">
                <Link to="/studio">Customize Your Clean</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span><strong className="font-semibold text-gold-soft">From {money(services[0].basePrice)}</strong> for a standard average 1 bed / 1 bath home</span>
              <span>Recurring savings up to 20%</span>
            </div>
          </div>

          <div className="relative min-h-[24rem] lg:min-h-[42rem]">
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-gold/20 lg:inset-y-0 lg:left-0 lg:right-[calc((100vw-82rem)/-2)] lg:rounded-none lg:rounded-l-[2.2rem]">
              <img
                src={heroImage}
                alt="Refined sunlit living room with warm neutral furnishings"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,23,44,0.78)_0%,rgba(6,23,44,0.2)_42%,rgba(6,23,44,0.04)_100%),linear-gradient(180deg,transparent_55%,rgba(6,23,44,0.5)_100%)]" aria-hidden="true" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-gold/25 bg-night/75 p-4 backdrop-blur-md sm:left-auto sm:max-w-xs">
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-gold-soft">Come home to tranquility</p>
                <p className="mt-2 text-sm leading-relaxed text-night-foreground/72">Clear service choices, thoughtful details, and custom review when the home needs it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-dark border-b border-gold/20 bg-night">
        <div className="container-page grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {serviceRail.map(({ icon: Icon, label, note, to }) => (
            <Link key={label} to={to} className="group flex min-h-32 items-center gap-4 px-3 py-6 sm:px-5 lg:min-h-36">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-moss transition-colors group-hover:bg-gold/10">
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
        <div className="container-page">
          <SectionHeading
            eyebrow="Service experience"
            title="More control without making the process complicated."
            intro="The new Tranquility experience keeps the important decisions visible, from base pricing to room scope to the details that need direct review."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {experiencePoints.map(({ icon: Icon, title, body }) => (
              <article key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-gold/45 hover:shadow-lift">
                <span className="flex size-11 items-center justify-center rounded-full border border-gold/25 bg-accent/45 text-moss"><Icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_25%,rgba(226,194,122,0.14),transparent_24%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.05),transparent_24%)]" aria-hidden="true" />
        <div className="container-page relative grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold-soft">
              <Sparkles className="size-3.5" aria-hidden="true" /> Tranquility Studio
            </div>
            <h2 className="mt-5 text-4xl text-ink md:text-6xl">Customize your clean around the way you actually live.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Build room scope, organize priorities, identify materials, document product preferences, mark protected areas, and create a Home Care Blueprint before continuing into a service request.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/studio">Open Tranquility Studio</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-gold/35 text-foreground hover:bg-gold/10 hover:text-gold-soft"><Link to="/quote">Request Custom Quote</Link></Button>
            </div>
          </div>

          <div className="luxury-panel studio-grid rounded-3xl p-5 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-moss">Your space. Your standards.</p>
                <p className="mt-1 font-display text-2xl text-ink">Build a Home Care Blueprint</p>
              </div>
              <SlidersHorizontal className="size-5 text-moss" aria-hidden="true" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {studioCards.map((item, index) => (
                <div key={item} className="rounded-xl border border-border bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-ink">{item}</span>
                    <span className="text-xs font-bold text-moss">0{index + 1}</span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${38 + index * 9}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <img src={linens} alt="Folded linen towels on a stone counter with a sprig of eucalyptus" width={1200} height={1200} loading="lazy" className="aspect-square w-full rounded-3xl object-cover shadow-lift" />
          <div>
            <SectionHeading eyebrow="Recurring service" title="A cleaner rhythm, with savings built in." intro="Recurring savings apply to the service price only. Add-ons remain at their approved listed rate." />
            <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
              {frequencies.map((frequency) => (
                <div key={frequency.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt><span className="text-sm font-semibold text-ink">{frequency.name}</span><span className="ml-2 text-xs font-semibold text-moss">{frequency.note}</span></dt>
                  <dd className="text-sm text-muted-foreground">Standard <span className="font-semibold tabular-nums text-ink">{money(servicePrice("standard", frequency.id))}</span></dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionHeading eyebrow="Service area" title="Across Dallas - Fort Worth" intro="We serve the DFW metroplex and consider surrounding communities on request." />
            <Link to="/service-area" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">See the full service area <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cities.map((city) => (
              <li key={city} className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-4 text-sm text-foreground shadow-soft"><MapPin className="size-4 text-moss" aria-hidden="true" />{city}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Questions" title="Good things to know before service." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {faqs.slice(0, 4).map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h3 className="flex items-start gap-3 text-xl"><CalendarCheck className="mt-1 size-4 shrink-0 text-moss" aria-hidden="true" />{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
          <Link to="/faq" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">Read all FAQs <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <CTABand title="A cleaner space starts with a clearer plan." intro="Choose a standard service, build a customized Tranquility Studio plan, or request a direct consultation for a more complex home." />
    </>
  );
}
