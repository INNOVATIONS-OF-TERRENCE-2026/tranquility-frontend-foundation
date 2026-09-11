import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

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

const considerations = {
  en: [
    "Square footage, layout, and the number of workspaces",
    "Restrooms, break rooms, and shared common areas",
    "How often the space needs service and preferred service periods",
    "Floor types, surfaces, and any specialty requirements",
    "Access, security, and site-specific arrangements",
  ],
  es: [
    "Pies cuadrados, distribución y cantidad de áreas de trabajo",
    "Baños, salas de descanso y áreas comunes compartidas",
    "Frecuencia de servicio y horarios preferidos",
    "Tipos de piso, superficies y requisitos especiales",
    "Acceso, seguridad y condiciones específicas del lugar",
  ],
};

function CommercialPage() {
  const { language, text } = useLanguage();
  return (
    <>
      <PageHero
        eyebrow={text({ en: "Commercial & office", es: "Comercial y oficinas" })}
        title={text({ en: "Commercial cleaning, quoted properly", es: "Limpieza comercial con una cotización adecuada" })}
        intro={text({
          en: "Commercial spaces vary too much to price like a home. Every commercial request starts with a consultation so the scope, schedule, and price reflect the actual space.",
          es: "Los espacios comerciales varían demasiado para cotizarlos como una vivienda. Cada solicitud comercial comienza con una consulta para que el alcance, el horario y el precio reflejen el espacio real.",
        })}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/quote">{text({ en: "Request a consultation", es: "Solicitar una consulta" })}</Link></Button>
          <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>{text({ en: "Call", es: "Llama al" })} {business.phoneDisplay}</a></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow={text({ en: "Custom scope", es: "Alcance personalizado" })}
              title={text({ en: "What we discuss first", es: "Lo que revisamos primero" })}
              intro={text({ en: "A focused conversation gives us what we need to build a realistic scope and schedule.", es: "Una conversación enfocada nos brinda la información necesaria para definir un alcance y un horario realistas." })}
            />
            <ul className="mt-8 space-y-4 text-sm text-foreground/85">
              {considerations[language].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-sand p-7 shadow-soft md:p-8">
            <p className="eyebrow">{text({ en: "Pricing approach", es: "Enfoque de precios" })}</p>
            <h2 className="mt-3 text-2xl">{text({ en: "Why there is no instant commercial price", es: "Por qué no ofrecemos un precio comercial instantáneo" })}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {text({
                en: "Residential base pricing is built around a standard average home. A commercial suite can have different traffic, surfaces, access requirements, and service expectations. Publishing a number before understanding the space would be a guess, so commercial pricing begins with a consultation.",
                es: "Los precios residenciales se basan en una vivienda estándar promedio. Un espacio comercial puede tener distintos niveles de tráfico, superficies, requisitos de acceso y expectativas de servicio. Publicar un precio antes de entender el espacio sería una estimación poco responsable, por eso el precio comercial comienza con una consulta.",
              })}
            </p>
            <Button asChild className="mt-6"><Link to="/quote">{text({ en: "Start a commercial quote", es: "Iniciar cotización comercial" })}</Link></Button>
          </div>
        </div>
      </section>

      <CTABand
        title="Tell us about your space"
        titleEs="Cuéntanos sobre tu espacio"
        intro="Share the property details and how the space is used. We will follow up to shape the right scope."
        introEs="Comparte los detalles de la propiedad y cómo se utiliza el espacio. Nos comunicaremos contigo para definir el alcance adecuado."
      />
    </>
  );
}
