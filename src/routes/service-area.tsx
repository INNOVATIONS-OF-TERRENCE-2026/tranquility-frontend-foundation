import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { business, cities } from "@/config/business";

export const Route = createFileRoute("/service-area")({
  head: () =>
    seo({
      title: "Service Area — Dallas–Fort Worth Cleaning | Tranquility Level Cleaning",
      description:
        "We clean homes and offices across Dallas, Fort Worth, Arlington, Plano, Frisco, McKinney and surrounding DFW communities.",
      path: "/service-area",
    }),
  component: ServiceAreaPage,
});

function ServiceAreaPage() {
  return (
    <>
      <PageHero
        eyebrow="Service area"
        title="Serving Dallas–Fort Worth"
        intro={`Tranquility Level Cleaning works across ${business.serviceAreaLabel}.`}
      />

      <section className="section">
        <div className="container-page">
          <SectionHeading title="Cities we serve" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li
                key={city}
                className="rounded-lg border border-border bg-card px-5 py-4 text-base text-ink shadow-soft"
              >
                {city}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Don't see your community listed? Surrounding communities may still be considered — get
            in touch and we'll let you know whether we can serve your address.
          </p>
        </div>
      </section>

      <CTABand
        title="Nearby but not listed?"
        intro="Reach out with your address and we'll tell you honestly whether we can cover it."
      />
    </>
  );
}
