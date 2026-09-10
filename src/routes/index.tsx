import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Layers3, Leaf, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";

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

const whyPoints = [
  {
    icon: Leaf,
    title: "A calmer home, not just a cleaner one",
    body: "We clean with the feel of the room in mind: order, light, and surfaces that invite you to relax when you walk in.",
  },
  {
    icon: ShieldCheck,
    title: "Clear expectations, every visit",
    body: "You know what's included, what an add-on costs, and what we'll confirm with you before we start. No surprises at the door.",
  },
  {
    icon: Sparkles,
    title: "Detail where it actually shows",
    body: "Edges, trim, fixtures, and the corners routine cleaning tends to pass over. These are the parts you notice long after we've gone.",
  },
  {
    icon: MessagesSquare,
    title: "Built around your space",
    body: "Pets, layout, delicate surfaces, product preferences, and unusual scope are discussed up front instead of improvised.",
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
      <section className="relative overflow-hidden border-b border-border bg-sand">
        <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-stone-soft/40 lg:block" aria-hidden="true" />
        <div className="container-page relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
          <div>
            <p className="eyebrow">Dallas-Fort Worth cleaning service</p>
            <h1 className="mt-4 max-w-2xl text-[2.8rem] leading-[1.02] md:text-6xl lg:text-7xl">Come home to tranquility.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Professional home cleaning with clear pricing, thoughtful customization, and a service experience built around how your home is actually lived in.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg"><Link to="/booking">Request Service</Link></Button>
              <Button asChild size="lg" variant="secondary"><Link to="/studio">Open Tranquility Studio</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/quote">Get a Custom Quote</Link></Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span><strong className="font-semibold text-ink">From {money(services[0].basePrice)}</strong> for a standard average 1 bed / 1 bath</span>
              <span>Recurring savings up to 20%</span>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <img
              src={heroImage}
              alt="Sunlit living room corner with a linen chair, warm plaster wall and oak floor"
              width={1600}
              height={1200}
              className="aspect-4/3 w-full rounded-2xl object-cover shadow-lift"
            />
            <div className="mt-4 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft sm:absolute sm:-bottom-8 sm:left-0 sm:mt-0 sm:max-w-xs">
              <span className="font-semibold text-ink">Serving DFW:</span> Dallas, Fort Worth, Arlington, Plano, and surrounding communities.
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          <div><p className="text-sm font-semibold text-ink">Clear starting prices</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">See approved service and add-on pricing before you request service.</p></div>
          <div><p className="text-sm font-semibold text-ink">Built for your actual scope</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Room quantities, pets, surfaces, and custom conditions stay visible and understandable.</p></div>
          <div><p className="text-sm font-semibold text-ink">Custom when it should be</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Large, unusual, partial-home, and commercial work can move into consultation instead of forced checkout logic.</p></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Services" title="Cleaning shaped to the moment you're in" intro="Whether it's regular upkeep, a full reset, or a home in transition, each service has a defined scope and an approved starting price." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Link key={service.id} to={service.route} className="group flex flex-col border-t border-border py-7 transition-colors hover:border-moss md:px-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl">{service.name}</h3>
                  <span className="font-display text-2xl text-ink">{money(service.basePrice)}</span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-moss">Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
            <Link to="/commercial-cleaning" className="group flex flex-col border-t border-border py-7 transition-colors hover:border-moss md:px-2">
              <div className="flex items-start justify-between gap-4"><h3 className="text-2xl">Commercial / Office Cleaning</h3><span className="text-sm font-semibold text-ink">Custom quote</span></div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">Offices, suites, and light commercial spaces. Commercial work is quoted after a consultation and is never priced like residential checkout.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-moss">Request a consultation <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Pricing" title="Straightforward pricing, visible up front" intro="Base pricing reflects a standard average 1-bedroom, 1-full-bath home. Add only what your home actually needs." />
          <div className="mt-10"><PricingGrid /></div>
        </div>
      </section>

      <section className="section overflow-hidden bg-ink text-background">
        <div className="container-page grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-1.5 text-xs font-semibold text-background/80"><Sparkles className="size-3.5" aria-hidden="true" /> Flagship planning experience</div>
            <h2 className="mt-5 text-4xl text-background md:text-5xl">Meet Tranquility Studio.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-background/75">Design your cleaning experience around the way you actually live. Build rooms, set priorities, organize surface and product preferences, define areas that should not be touched, and create a polished Home Care Blueprint.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary"><Link to="/studio">Build Your Tranquility Plan</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-background/35 bg-transparent text-background hover:bg-background/10 hover:text-background"><Link to="/booking">Request Service</Link></Button>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-background/55">Studio is frontend-only in this release. Photos remain local, customer information is not stored, and visual preferences do not create unapproved charges.</p>
          </div>
          <div className="studio-grid rounded-2xl border border-background/15 bg-background/[0.04] p-5 md:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Room planning", "Cleaning priorities", "Style and palette profile", "Surface awareness", "Protected areas", "Home Care Blueprint"].map((item, index) => (
                <div key={item} className="rounded-xl border border-background/15 bg-background/[0.05] p-5">
                  {index % 2 === 0 ? <Layers3 className="size-5 text-moss-soft" aria-hidden="true" /> : <Sparkles className="size-5 text-oak" aria-hidden="true" />}
                  <p className="mt-4 text-sm font-semibold text-background">{item}</p>
                  <p className="mt-1 text-xs leading-relaxed text-background/55">Organized into one coherent plan that stays separate from unsupported services or pricing.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Why Tranquility" title="Considered work, start to finish" intro="Cleaning is a service you let into your home. We treat that access with care." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {whyPoints.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft"><Icon className="size-5 text-moss" aria-hidden="true" /><h3 className="mt-4 text-lg">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Three simple steps" />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((item) => <li key={item.step} className="border-t border-border pt-5"><p className="font-display text-4xl text-moss-soft">{item.step}</p><h3 className="mt-3 text-xl">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Recurring service" title="Keep it going, and pay less each visit" intro="Recurring savings apply to the service price only. Add-ons are always charged at their listed rate." />
            <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card shadow-soft">
              {frequencies.map((frequency) => <div key={frequency.id} className="flex items-center justify-between gap-4 px-5 py-4"><dt><span className="text-sm font-semibold text-ink">{frequency.name}</span><span className="ml-2 text-xs text-moss">{frequency.note}</span></dt><dd className="text-sm text-muted-foreground">Standard <span className="font-semibold text-ink">{money(servicePrice("standard", frequency.id))}</span></dd></div>)}
            </dl>
          </div>
          <img src={linens} alt="Folded linen towels on a stone counter with a sprig of eucalyptus" width={1200} height={1200} loading="lazy" className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div><p className="eyebrow">Virtual consultation</p><h2 className="mt-3 text-3xl md:text-4xl">Larger, unusual, or partial-home scope?</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Some homes should not be priced by a calculator. Homes around 3,000 sq ft and larger, partial-home requests, specialty surfaces, and commercial spaces are reviewed directly so the quote reflects the actual work involved.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end"><Button asChild size="lg"><Link to="/quote">Request a consultation</Link></Button><Button asChild size="lg" variant="outline"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page"><SectionHeading eyebrow="Service area" title="Across Dallas-Fort Worth" intro="We serve the DFW metroplex and consider surrounding communities on request." /><ul className="mt-8 flex flex-wrap gap-2">{cities.map((city) => <li key={city} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/80">{city}</li>)}</ul><Link to="/service-area" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">See the full service area <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </section>

      <section className="section bg-sand">
        <div className="container-page"><SectionHeading eyebrow="Questions" title="Good things to know" /><div className="mt-10 grid gap-6 md:grid-cols-2">{faqs.slice(0, 4).map((faq) => <div key={faq.question}><h3 className="flex items-start gap-2 text-lg"><CalendarCheck className="mt-1 size-4 shrink-0 text-moss" aria-hidden="true" />{faq.question}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p></div>)}</div><Link to="/faq" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">Read all FAQs <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </section>

      <CTABand />
    </>
  );
}
