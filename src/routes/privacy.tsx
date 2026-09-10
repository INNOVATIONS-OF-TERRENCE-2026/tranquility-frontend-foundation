import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy | Tranquility Level Cleaning",
      description: "Privacy information for the Tranquility Level Cleaning website.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Your information should be handled with care."
        intro="This page explains how the current Tranquility website handles information entered into its frontend forms."
      />

      <section className="section">
        <div className="container-page max-w-3xl space-y-10">
          <section>
            <h2 className="text-2xl">Current website form behavior</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The current website does not use a customer database, payment processor, or account system. Contact, career, service request, and quote experiences may prepare information locally in your browser and open your email application so you can send it directly to Tranquility Level Cleaning.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Information you choose to provide</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Depending on the form, you may choose to provide your name, email, phone number, service address, property details, scheduling preferences, cleaning scope, career information, and written notes. Only provide information that is relevant to your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Sensitive information</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Do not submit Social Security numbers, banking information, account credentials, identification documents, medical information, or other sensitive personal records through public website forms or photo-selection areas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Photos selected for virtual consultation</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              In the current frontend version, selecting property photos does not upload them to a server. Browser previews remain local to your device unless you separately choose to send files using a communication method provided by Tranquility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Future service changes</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              If the website later adds hosted form submissions, online payments, customer accounts, analytics, or other connected services, this notice should be updated to describe those systems before they are relied upon for customer information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl">Contact</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Questions about website privacy can be directed to{" "}
              <a className="font-semibold text-moss hover:underline" href={business.emailHref}>
                {business.email}
              </a>{" "}
              or{" "}
              <a className="font-semibold text-moss hover:underline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
