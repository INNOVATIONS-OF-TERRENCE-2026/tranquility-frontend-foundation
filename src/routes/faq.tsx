import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { CTABand } from "@/components/site/CTABand";
import { faqs } from "@/config/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    ...seo({
      title: "Cleaning Service FAQs | Tranquility Level Cleaning",
      description:
        "Clear answers about pricing, recurring savings, pets, supplies, large or partial-home scope, consultations, add-ons, and commercial cleaning.",
      path: "/faq",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly"
        intro="If something is not covered here, call or email us. We would rather answer directly than leave you guessing."
      />

      <section className="section">
        <div className="container-page max-w-3xl">
          <Accordion type="single" collapsible className="w-full rounded-2xl border border-border bg-card px-5 shadow-soft md:px-7">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CTABand />
    </>
  );
}
