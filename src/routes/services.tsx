import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PricingGrid } from "@/components/site/PricingGrid";
import { CTABand } from "@/components/site/CTABand";
import { Button } from "@/components/ui/button";
import { addOns, addOnPrice, money, services } from "@/config/pricing";

export const Route = createFileRoute("/services")({
  head: () =>
    seo({
      title: "Cleaning Services in DFW — Tranquility Level Cleaning",
      description:
        "Standard, deep, move-in/move-out and commercial cleaning across Dallas–Fort Worth. Approved base pricing, recurring savings, and a clear add-on list.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Cleaning services across Dallas–Fort Worth"
        intro="Four ways to work with us — three with published starting prices, and commercial work quoted after a consultation."
      />

      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-xl border border-border bg-card p-7 shadow-soft"
            >
              <h2 className="text-2xl">{service.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/80">
                {service.includes.slice(0, 4).map((i) => (
                  <li key={i}>— {i}</li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-semibold text-ink">
                From {money(service.basePrice)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/booking" search={{ service: service.id }}>
                    Request service
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={service.route}>Details</Link>
                </Button>
              </div>
            </article>
          ))}

          <article className="flex flex-col rounded-xl border border-border bg-accent/50 p-7 shadow-soft md:col-span-2">
            <h2 className="text-2xl">Commercial / Office Cleaning</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Offices, suites and light commercial spaces vary too much to price like a home.
              Commercial work always goes through a custom quote or virtual consultation.
            </p>
            <Link
              to="/commercial-cleaning"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline"
            >
              Commercial cleaning <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Pricing" title="Approved base pricing" />
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
            intro="Add-on pricing varies by cleaning type where noted. Items marked “starting at” are a minimum and may be adjusted after review."
          />
          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[38rem] text-sm">
              <caption className="sr-only">Add-on pricing by cleaning type</caption>
              <thead className="bg-muted text-left">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Add-on
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Standard
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Deep
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Move-In / Out
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {addOns.map((a) => (
                  <tr key={a.id}>
                    <th scope="row" className="px-5 py-3 text-left font-medium text-ink">
                      {a.name}
                      {a.startingAt && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          starting at
                        </span>
                      )}
                      {a.unit && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          per {a.unit}
                        </span>
                      )}
                      {a.note && (
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {a.note}
                        </span>
                      )}
                    </th>
                    <td className="px-5 py-3 text-right tabular-nums">
                      +{money(addOnPrice(a, "standard"))}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      +{money(addOnPrice(a, "deep"))}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      +{money(addOnPrice(a, "move"))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Base pricing already includes 1 bedroom and 1 full bathroom — additional rooms are
            counted from there, so nothing is charged twice.
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
