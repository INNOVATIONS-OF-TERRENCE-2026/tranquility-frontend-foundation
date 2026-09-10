import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { business } from "@/config/business";
import linens from "@/assets/detail-linens.jpg";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Tranquility Level Cleaning | DFW Cleaning Service",
      description:
        "Thoughtful, respectful, detail-oriented cleaning across Dallas-Fort Worth, built on clear expectations and consistent work.",
      path: "/about",
    }),
  component: AboutPage,
});

const values = [
  {
    title: "Clear expectations",
    body: "You know the scope, the price, and what happens next before we begin. Anything that changes is confirmed with you first.",
  },
  {
    title: "Respect for your space",
    body: "Your home is not a job site. We work carefully around your belongings, your surfaces, and the way you live.",
  },
  {
    title: "Consistency",
    body: "The same standard every visit helps the home hold its calm between cleans instead of resetting each time.",
  },
  {
    title: "Thoughtful handling",
    body: "Pets, layout quirks, delicate materials, and special conditions are planned for instead of improvised on the day.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Cleaning that makes a home feel lighter"
        intro={`${business.legalName} is a Dallas-Fort Worth cleaning service built around a simple idea: a well-kept home should feel calmer to come back to.`}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading title="Our approach" />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Most cleaning is measured in checklists. We think about the result you actually live with: surfaces that feel finished, rooms that feel settled, and a home that asks less of you at the end of the day.
              </p>
              <p>
                That means being deliberate about scope. We price from a standard average home and add only what your space genuinely needs instead of running your home through a square-footage formula. When something falls outside the ordinary, such as a larger property, a partial-home request, or specialty surfaces, we talk it through instead of guessing.
              </p>
              <p>
                It also means being clear about what we can and cannot do. Everything we commit to is confirmed with you first, in plain language.
              </p>
            </div>
          </div>
          <img
            src={linens}
            alt="Neatly folded linen towels with a sprig of eucalyptus on a stone surface"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="What we hold to" title="How we work" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
