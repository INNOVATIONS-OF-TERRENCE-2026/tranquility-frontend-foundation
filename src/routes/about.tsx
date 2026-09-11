import { createFileRoute } from "@tanstack/react-router";

import linens from "@/assets/detail-linens.jpg";
import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

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

const values = {
  en: [
    { title: "Clear expectations", body: "You know the scope, the price, and what happens next before we begin. Anything that changes is confirmed with you first." },
    { title: "Respect for your space", body: "Your home is not a job site. We work carefully around your belongings, your surfaces, and the way you live." },
    { title: "Consistency", body: "The same standard every visit helps the home hold its calm between cleans instead of resetting each time." },
    { title: "Thoughtful handling", body: "Pets, layout quirks, delicate materials, and special conditions are planned for instead of improvised on the day." },
  ],
  es: [
    { title: "Expectativas claras", body: "Conoces el alcance, el precio y lo que sigue antes de comenzar. Cualquier cambio se confirma contigo primero." },
    { title: "Respeto por tu espacio", body: "Tu hogar no es un lugar de trabajo cualquiera. Trabajamos con cuidado alrededor de tus pertenencias, tus superficies y tu forma de vivir." },
    { title: "Consistencia", body: "Mantener el mismo estándar en cada visita ayuda a que el hogar conserve esa sensación de calma entre limpiezas." },
    { title: "Atención cuidadosa", body: "Las mascotas, distribuciones particulares, materiales delicados y condiciones especiales se consideran con anticipación en lugar de improvisarse el día del servicio." },
  ],
};

function AboutPage() {
  const { language, text } = useLanguage();
  return (
    <>
      <PageHero
        eyebrow={text({ en: "About", es: "Nosotros" })}
        title={text({ en: "Cleaning that makes a home feel lighter", es: "Limpieza que hace que tu hogar se sienta más ligero" })}
        intro={text({
          en: `${business.legalName} is a Dallas-Fort Worth cleaning service built around a simple idea: a well-kept home should feel calmer to come back to.`,
          es: `${business.legalName} es un servicio de limpieza en Dallas-Fort Worth basado en una idea sencilla: regresar a un hogar bien cuidado debe sentirse más tranquilo.`,
        })}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading title={text({ en: "Our approach", es: "Nuestro enfoque" })} />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{text({
                en: "Most cleaning is measured in checklists. We think about the result you actually live with: surfaces that feel finished, rooms that feel settled, and a home that asks less of you at the end of the day.",
                es: "Muchas limpiezas se miden con listas de tareas. Nosotros pensamos en el resultado que realmente vives: superficies bien terminadas, habitaciones que se sienten en orden y un hogar que te exige menos al final del día.",
              })}</p>
              <p>{text({
                en: "That means being deliberate about scope. We price from a standard average home and add only what your space genuinely needs instead of running your home through a square-footage formula. When something falls outside the ordinary, such as a larger property, a partial-home request, or specialty surfaces, we talk it through instead of guessing.",
                es: "Eso significa definir el alcance con intención. Partimos del precio de una vivienda estándar promedio y agregamos solo lo que tu espacio realmente necesita, en lugar de usar una fórmula basada únicamente en pies cuadrados. Cuando algo sale de lo habitual, como una propiedad grande, una solicitud parcial o superficies especiales, lo revisamos contigo en vez de adivinar.",
              })}</p>
              <p>{text({
                en: "It also means being clear about what we can and cannot do. Everything we commit to is confirmed with you first, in plain language.",
                es: "También significa ser claros sobre lo que podemos y no podemos hacer. Todo compromiso se confirma contigo primero, con lenguaje directo y sencillo.",
              })}</p>
            </div>
          </div>
          <img
            src={linens}
            alt={text({ en: "Neatly folded linen towels with a sprig of eucalyptus on a stone surface", es: "Toallas de lino dobladas cuidadosamente con una ramita de eucalipto sobre una superficie de piedra" })}
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow={text({ en: "What we hold to", es: "Nuestros principios" })} title={text({ en: "How we work", es: "Cómo trabajamos" })} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values[language].map((value) => (
              <div key={value.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
