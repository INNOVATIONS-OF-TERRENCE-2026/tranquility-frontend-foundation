import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "Website Terms | Tranquility Level Cleaning",
      description: "Website terms and service-request information for Tranquility Level Cleaning.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Website terms"
        title="Clear expectations before service is confirmed."
        intro="The website helps you understand services, review pricing, and share your cleaning needs. A website request is not a guaranteed appointment."
      />

      <section className="section">
        <div className="container-page max-w-3xl space-y-10">
          <section>
            <h2 className="text-2xl">Service requests and quotes</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Information submitted through the website is a request for review. Service scope, timing, availability, and final pricing may require confirmation before an appointment is accepted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Pricing shown online</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Residential base pricing is based on a standard average 1-bedroom, 1-full-bath home. Square footage, layout, condition, customizations, additional rooms, unusual scope, specialty work, and selected add-ons may affect the final amount. Starting-at items may require review before a final price is confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Custom and commercial work</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Large properties, partial-home requests, unusual layouts, specialty cleaning, and commercial or office work are handled through a custom quote or consultation rather than residential instant pricing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Scheduling</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A preferred date or arrival window is a request, not a guarantee of availability. Tranquility will confirm service timing with you before the visit is treated as scheduled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Payments</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The current website does not collect payment-card information. Any future payment process must be separately presented and authorized before it is used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Website content</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The website is intended to provide accurate service information, but a specific cleaning request may require details that cannot be fully evaluated online. When a property or requested scope falls outside the standard assumptions shown on the site, Tranquility may recommend a custom quote.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Questions</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For questions about service expectations, call{" "}
              <a className="font-semibold text-moss hover:underline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>{" "}
              or email{" "}
              <a className="font-semibold text-moss hover:underline" href={business.emailHref}>
                {business.email}
              </a>. You can also use the{" "}
              <Link className="font-semibold text-moss hover:underline" to="/contact">
                contact page
              </Link>.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
