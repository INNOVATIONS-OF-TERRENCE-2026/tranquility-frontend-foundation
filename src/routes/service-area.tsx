import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { ServiceAreaExplorer } from "@/components/site/ServiceAreaExplorer";
import { business, cities } from "@/config/business";

export const Route = createFileRoute("/service-area")({
  head: () =>
    seo({
      title: "Service Area | Dallas-Fort Worth Cleaning | Tranquility Level Cleaning",
      description:
        "Explore Tranquility Level Cleaning service cities across Dallas-Fort Worth, including Euless, with an interactive map, searchable city selector, and radius planning tool.",
      path: "/service-area",
    }),
  component: ServiceAreaPage,
});

function ServiceAreaPage() {
  return (
    <>
      <PageHero
        eyebrow="Service area"
        title="DFW coverage you can actually explore"
        intro={`Tranquility Level Cleaning works across ${business.serviceAreaLabel}. Search the current city list, inspect the map, and use the radius tool to understand nearby listed communities.`}
      />

      <section className="section">
        <div className="container-page">
          <ServiceAreaExplorer />
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow="Core communities"
            title={`${cities.length} listed DFW cities`}
            intro="The list now includes Euless. Surrounding communities may also be considered after address review."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cities.map((city) => (
              <li
                key={city}
                className="rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold text-ink shadow-soft"
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Nearby but not listed?"
        intro="Send your address and Tranquility can confirm whether the location falls within the current service reach."
      />
    </>
  );
}
