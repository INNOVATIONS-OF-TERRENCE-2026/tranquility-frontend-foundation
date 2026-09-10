import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";

export const Route = createFileRoute("/commercial-cleaning")({
  head: () =>
    seo({
      title: "Commercial & Office Cleaning in DFW | Tranquility Level Cleaning",
      description:
        "Office and light commercial cleaning across Dallas-Fort Worth, quoted after a consultation so the scope and schedule fit your space.",
      path: "/commercial-cleaning",
    }),
  component: CommercialPage,
});

const considerations = [
  "Square footage, layout, and the number of workspaces",
  "Restrooms, break rooms, and shared common areas",
  "How often the space needs service and preferred service periods",
  "Floor types, surfaces, and any specialty requirements",
  "Access, security, and site-specific arrangements",
];

function CommercialPage() {
  return (
    <>
      <PageHero
        eyebrow="Commercial & office"
        title="Commercial cleaning, quoted properly"
        intro="Commercial spaces vary too much to price like a home. Every commercial request starts with a consultation so the scope, schedule, and price reflect the actual space."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/quote">Request a consultation</Link></Button>
          <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Custom scope"
              title="What we discuss first"
              intro="A focused conversation gives us what we need to build a realistic scope and schedule."
            />
            <ul className="mt-8 space-y-4 text-sm text-foreground/85">
              {considerations.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-sand p-7 shadow-soft md:p-8">
            <p className="eyebrow">Pricing approach</p>
            <h2 className="mt-3 text-2xl">Why there is no instant commercial price</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Residential base pricing is built around a standard average home. A commercial suite can have different traffic, surfaces, access requirements, and service expectations. Publishing a number before understanding the space would be a guess, so commercial pricing begins with a consultation.
            </p>
            <Button asChild className="mt-6"><Link to="/quote">Start a commercial quote</Link></Button>
          </div>
        </div>
      </section>

      <CTABand
        title="Tell us about your space"
        intro="Share the property details and how the space is used. We will follow up to shape the right scope."
      />
    </>
  );
}
