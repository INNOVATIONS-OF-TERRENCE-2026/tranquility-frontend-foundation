import { createFileRoute, Link } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";

export const Route = createFileRoute("/commercial-cleaning")({
  head: () =>
    seo({
      title: "Commercial & Office Cleaning in DFW — Tranquility Level Cleaning",
      description:
        "Office and light commercial cleaning across Dallas–Fort Worth, always quoted after a consultation so the scope and schedule fit your space.",
      path: "/commercial-cleaning",
    }),
  component: CommercialPage,
});

const considerations = [
  "Square footage, layout and the number of workspaces",
  "Restrooms, break rooms and shared common areas",
  "How often the space needs service and at what hours",
  "Floor types, surfaces and any specialty requirements",
  "Access, security and after-hours arrangements",
];

function CommercialPage() {
  return (
    <>
      <PageHero
        eyebrow="Commercial & office"
        title="Commercial cleaning, quoted properly"
        intro="Commercial spaces vary too much to price like a home. Every commercial request starts with a consultation so the scope, schedule and price reflect the actual space."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/quote">Request a consultation</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={business.phoneHref}>Call {business.phoneDisplay}</a>
          </Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="What we discuss first"
              intro="A short conversation gives us what we need to build a realistic scope and schedule."
            />
            <ul className="mt-8 space-y-3 text-sm text-foreground/85">
              {considerations.map((c) => (
                <li key={c}>— {c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-sand p-7">
            <h2 className="text-xl">Why there's no instant price</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Residential base pricing is built around a standard average home. A commercial suite
              has different traffic, different surfaces, and different expectations. Publishing a
              number before seeing the space would be a guess — so instead we quote it after we
              understand it.
            </p>
            <Button asChild className="mt-6">
              <Link to="/quote">Start a commercial quote</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTABand
        title="Let's look at your space"
        intro="Tell us about the property and how it's used, and we'll follow up to build a quote."
      />
    </>
  );
}
