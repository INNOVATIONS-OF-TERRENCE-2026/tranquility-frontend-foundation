import { createFileRoute } from "@tanstack/react-router";
import { Droplets, ShieldCheck, Sparkles, Wind } from "lucide-react";

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

          <div className="brand-dark relative overflow-hidden rounded-[2rem] border border-white/10 bg-night p-6 text-white shadow-lift md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(143,215,209,0.18),transparent_28%)]" aria-hidden="true" />
            <div className="relative">
              <div className="mx-auto flex size-52 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-3">
                <img src="/tranquility-official-logo.png" alt="Tranquility Level Cleaning official logo" className="h-full w-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)]" width={1024} height={1024} loading="lazy" decoding="async" />
              </div>
              <p className="mt-6 text-center font-display text-3xl text-white">Tranquility Level Cleaning</p>
              <p className="mt-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-soft">{text({ en: "Clean spaces. Calmer days.", es: "Espacios limpios. Días más tranquilos." })}</p>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                <div><Wind className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Calm", es: "Calma" })}</p></div>
                <div><Droplets className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Fresh", es: "Fresco" })}</p></div>
                <div><ShieldCheck className="mx-auto size-4 text-gold-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Careful", es: "Cuidadoso" })}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow={text({ en: "What we hold to", es: "Nuestros principios" })} title={text({ en: "How we work", es: "Cómo trabajamos" })} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values[language].map((value, index) => (
              <div key={value.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-moss"><Sparkles className="size-4" aria-hidden="true" /></span>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-moss">0{index + 1}</p>
                <h3 className="mt-2 text-xl">{value.title}</h3>
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
