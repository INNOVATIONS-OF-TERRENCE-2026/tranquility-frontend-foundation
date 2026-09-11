import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, PackageOpen, Sparkles } from "lucide-react";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PricingGrid } from "@/components/site/PricingGrid";
import { CTABand } from "@/components/site/CTABand";
import { Button } from "@/components/ui/button";
import { addOns, addOnPrice, money, services } from "@/config/pricing";

export const Route = createFileRoute("/services")({
  head: () =>
    seo({
      title: "Cleaning Services in DFW | Tranquility Level Cleaning",
      description:
        "Standard, deep, move-in/move-out, and commercial cleaning across Dallas-Fort Worth with approved base pricing, recurring savings, and home customization through Tranquility Studio.",
      path: "/services",
    }),
  component: ServicesPage,
});

const serviceIcons = [Home, Sparkles, PackageOpen] as const;

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Choose the level of care your home needs."
        intro="Three residential cleaning types have published starting prices. Commercial work is quoted after consultation. Every residential path can be customized without hiding the pricing foundation."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link to="/booking">Request Service</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/studio">Customize Your Clean</Link></Button>
          <Button asChild size="lg" variant="outline" className="border-gold/35 text-foreground hover:bg-gold/10"><Link to="/quote">Get a Custom Quote</Link></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Residential services" title="Clear starting points. Flexible scope." intro="Each service starts with the approved base rate for a standard average 1-bedroom, 1-full-bath home and can be adjusted with approved room charges and add-ons." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = serviceIcons[index] ?? Home;
              return (
                <article key={service.id} className="group flex min-h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-gold/45 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-full border border-gold/25 bg-accent/45 text-moss"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="font-display text-3xl text-ink">{money(service.basePrice)}</span>
                  </div>
                  <h2 className="mt-5 text-3xl">{service.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/80">
                    {service.includes.slice(0, 4).map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss" aria-hidden="true" />{item}</li>)}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-2">
                    <Button asChild size="sm"><Link to="/booking" search={{ service: service.id }}>Request service</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to={service.route}>Service details</Link></Button>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="brand-dark mt-5 grid gap-6 rounded-2xl border border-gold/20 bg-background p-6 shadow-lift md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
            <span className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-moss"><Building2 className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-3xl text-ink">Commercial / Office Cleaning</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Offices, suites, and light commercial spaces vary too much to price like a home. Commercial work always goes through a custom quote or consultation.
              </p>
            </div>
            <Button asChild><Link to="/commercial-cleaning">Commercial details <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </article>
        </div>
      </section>

      <section className="brand-dark section relative overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(226,194,122,0.15),transparent_25%)]" aria-hidden="true" />
        <div className="container-page relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-gold-soft"><Sparkles className="size-4" aria-hidden="true" /> Tranquility Studio</div>
            <h2 className="mt-3 text-4xl text-ink md:text-5xl">Know the service. Now personalize the home.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Build a room plan, define focus areas, document materials and product preferences, protect do-not-touch areas, and create a Home Care Blueprint before requesting service.
            </p>
          </div>
          <Button asChild size="lg"><Link to="/studio">Build Your Tranquility Plan</Link></Button>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Pricing" title="Approved base pricing" intro="Recurring savings apply only to the service subtotal. Add-ons stay at their listed rate." />
          <div className="mt-10"><PricingGrid /></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Add-ons" title="Customize only what you need" intro="Add-on pricing varies by cleaning type where noted. Items marked starting at are minimum prices and may be adjusted after review." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-lift">
            <table className="w-full min-w-[38rem] text-sm">
              <caption className="sr-only">Add-on pricing by cleaning type</caption>
              <thead className="bg-muted text-left"><tr><th scope="col" className="px-5 py-4 font-semibold">Add-on</th><th scope="col" className="px-5 py-4 text-right font-semibold">Standard</th><th scope="col" className="px-5 py-4 text-right font-semibold">Deep</th><th scope="col" className="px-5 py-4 text-right font-semibold">Move-In / Out</th></tr></thead>
              <tbody className="divide-y divide-border">
                {addOns.map((addOn) => (
                  <tr key={addOn.id} className="transition-colors hover:bg-accent/25">
                    <th scope="row" className="px-5 py-4 text-left font-medium text-ink">
                      {addOn.name}
                      {addOn.startingAt && <span className="ml-2 text-xs font-normal text-muted-foreground">starting at</span>}
                      {addOn.unit && <span className="ml-2 text-xs font-normal text-muted-foreground">per {addOn.unit}</span>}
                      {addOn.note && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{addOn.note}</span>}
                    </th>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "standard"))}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "deep"))}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "move"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Base pricing already includes 1 bedroom and 1 full bathroom. Additional rooms are counted from there so nothing is charged twice.</p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
