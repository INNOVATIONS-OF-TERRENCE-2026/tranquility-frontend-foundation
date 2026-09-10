import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

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
        "Standard, deep, move-in/move-out, and commercial cleaning across Dallas-Fort Worth. Approved base pricing, recurring savings, and clear add-on pricing.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Cleaning services across Dallas-Fort Worth"
        intro="Choose the level of care that fits your home today. Residential services show approved starting prices. Commercial work is quoted after consultation."
      />

      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-soft md:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow">Residential</p>
                  <h2 className="mt-3 text-2xl md:text-3xl">{service.name}</h2>
                </div>
                <p className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-ink">
                  From {money(service.basePrice)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/80">
                {service.includes.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/booking" search={{ service: service.id }}>
                    Request service
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={service.route}>View details</Link>
                </Button>
              </div>
            </article>
          ))}

          <article className="flex flex-col rounded-2xl border border-border bg-accent/50 p-7 shadow-soft md:col-span-2 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="eyebrow">Business spaces</p>
                <h2 className="mt-3 text-2xl md:text-3xl">Commercial / Office Cleaning</h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Offices, suites, and light commercial spaces vary in layout, traffic, access, and service needs. Commercial work always goes through a custom quote or consultation.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/commercial-cleaning">
                  Commercial details <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow="Pricing"
            title="Approved base pricing"
            intro="Base pricing reflects a standard average 1-bedroom, 1-full-bath home. Frequency savings apply to the service subtotal only."
          />
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Add-ons"
            title="Customize only what you need"
            intro="Add-on pricing varies by cleaning type where noted. Items marked as starting at are minimum prices and may be adjusted after review."
          />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[42rem] text-sm">
              <caption className="sr-only">Add-on pricing by cleaning type</caption>
              <thead className="bg-muted text-left">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Add-on</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Standard</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Deep</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Move-In / Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {addOns.map((addon) => (
                  <tr key={addon.id} className="align-top">
                    <th scope="row" className="px-5 py-4 text-left font-medium text-ink">
                      {addon.name}
                      {addon.startingAt && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">starting at</span>
                      )}
                      {addon.unit && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">per {addon.unit}</span>
                      )}
                      {addon.note && (
                        <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                          {addon.note}
                        </span>
                      )}
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums">+{money(addOnPrice(addon, "standard"))}</td>
                    <td className="px-5 py-4 text-right tabular-nums">+{money(addOnPrice(addon, "deep"))}</td>
                    <td className="px-5 py-4 text-right tabular-nums">+{money(addOnPrice(addon, "move"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Base pricing includes 1 bedroom and 1 full bathroom. Additional room charges begin only after that baseline, so the same room is not charged twice.
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
