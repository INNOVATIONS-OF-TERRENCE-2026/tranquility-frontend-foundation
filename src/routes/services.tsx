import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

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

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Choose the level of care your home needs"
        intro="Three residential cleaning types have published starting prices. Commercial work is quoted after consultation. Every residential path can be customized without hiding the pricing foundation."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link to="/booking">Request Service</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/studio">Open Tranquility Studio</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/quote">Get a Custom Quote</Link></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-x-10 gap-y-8 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="flex flex-col border-t border-border pt-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-3xl">{service.name}</h2>
                <span className="font-display text-3xl text-ink">{money(service.basePrice)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/80">
                {service.includes.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild size="sm"><Link to="/booking" search={{ service: service.id }}>Request service</Link></Button>
                <Button asChild size="sm" variant="outline"><Link to={service.route}>Service details</Link></Button>
              </div>
            </article>
          ))}

          <article className="flex flex-col border-t border-border bg-sand/60 p-6 md:col-span-2 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
            <div>
              <h2 className="text-3xl">Commercial / Office Cleaning</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Offices, suites, and light commercial spaces vary too much to price like a home. Commercial work always goes through a custom quote or consultation.
              </p>
            </div>
            <Button asChild className="mt-5 md:mt-0"><Link to="/commercial-cleaning">Commercial cleaning details</Link></Button>
          </article>
        </div>
      </section>

      <section className="section bg-ink text-background">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-moss-soft"><Sparkles className="size-4" aria-hidden="true" /> Tranquility Studio</div>
            <h2 className="mt-3 text-4xl text-background">Know the service. Now personalize the home.</h2>
            <p className="mt-4 text-sm leading-relaxed text-background/70">
              Build a room plan, define focus areas, document materials and product preferences, protect do-not-touch areas, and create a Home Care Blueprint before requesting service.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary"><Link to="/studio">Build Your Tranquility Plan</Link></Button>
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
          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[38rem] text-sm">
              <caption className="sr-only">Add-on pricing by cleaning type</caption>
              <thead className="bg-muted text-left"><tr><th scope="col" className="px-5 py-3 font-semibold">Add-on</th><th scope="col" className="px-5 py-3 text-right font-semibold">Standard</th><th scope="col" className="px-5 py-3 text-right font-semibold">Deep</th><th scope="col" className="px-5 py-3 text-right font-semibold">Move-In / Out</th></tr></thead>
              <tbody className="divide-y divide-border">
                {addOns.map((addOn) => (
                  <tr key={addOn.id}>
                    <th scope="row" className="px-5 py-3 text-left font-medium text-ink">
                      {addOn.name}
                      {addOn.startingAt && <span className="ml-2 text-xs font-normal text-muted-foreground">starting at</span>}
                      {addOn.unit && <span className="ml-2 text-xs font-normal text-muted-foreground">per {addOn.unit}</span>}
                      {addOn.note && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{addOn.note}</span>}
                    </th>
                    <td className="px-5 py-3 text-right tabular-nums">+{money(addOnPrice(addOn, "standard"))}</td>
                    <td className="px-5 py-3 text-right tabular-nums">+{money(addOnPrice(addOn, "deep"))}</td>
                    <td className="px-5 py-3 text-right tabular-nums">+{money(addOnPrice(addOn, "move"))}</td>
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
