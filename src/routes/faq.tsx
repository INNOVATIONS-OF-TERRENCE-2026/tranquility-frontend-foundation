import { createFileRoute } from "@tanstack/react-router";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero } from "@/components/site/PageHero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/config/faqs";
import { seo } from "@/lib/seo";

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
  const { language, text } = useLanguage();
  return (
    <>
      <PageHero
        eyebrow={text({ en: "FAQ", es: "Preguntas frecuentes" })}
        title={text({ en: "Questions, answered plainly", es: "Respuestas claras a tus preguntas" })}
        intro={text({
          en: "If something is not covered here, call or email us. We would rather answer directly than leave you guessing.",
          es: "Si algo no aparece aquí, llámanos o envíanos un correo. Preferimos responderte directamente antes que dejarte con dudas.",
        })}
      />

      <section className="section">
        <div className="container-page max-w-3xl">
          <Accordion type="single" collapsible className="w-full rounded-2xl border border-border bg-card px-5 shadow-soft md:px-7">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">{language === "es" ? faq.questionEs : faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {language === "es" ? faq.answerEs : faq.answer}
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
