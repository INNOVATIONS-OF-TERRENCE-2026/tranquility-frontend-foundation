import { createFileRoute } from "@tanstack/react-router";
import { Code2, Droplets, ShieldCheck, Sparkles, Wind } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { attribution, businessLeader, technologyLeader } from "@/config/leadership";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Tranquility Level Cleaning | DFW Cleaning Service",
      description:
        "Meet the leadership behind Tranquility Level Cleaning and learn how thoughtful service, safety awareness, and professional technology support the customer experience.",
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
                <img
                  src="/tranquility-official-logo.png"
                  alt="Tranquility Level Cleaning official logo"
                  className="h-full w-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)]"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mt-6 text-center font-display text-3xl text-white">Tranquility Level Cleaning</p>
              <p className="mt-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-soft">
                {text({ en: "Clean spaces. Calmer days.", es: "Espacios limpios. Días más tranquilos." })}
              </p>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                <div><Wind className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Calm", es: "Calma" })}</p></div>
                <div><Droplets className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Fresh", es: "Fresco" })}</p></div>
                <div><ShieldCheck className="mx-auto size-4 text-gold-soft" aria-hidden="true" /><p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-white/60">{text({ en: "Careful", es: "Cuidadoso" })}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-border bg-[linear-gradient(180deg,var(--background),var(--sand))]">
        <div className="container-page">
          <SectionHeading
            eyebrow={text(attribution.leadershipHeading)}
            title={text({ en: "The people behind the experience", es: "Las personas detrás de la experiencia" })}
            intro={text({
              en: "Business leadership and technology leadership are presented separately so ownership, professional credentials, and engineering responsibility remain clear.",
              es: "El liderazgo empresarial y el liderazgo tecnológico se presentan por separado para que la propiedad, las credenciales profesionales y la responsabilidad de ingeniería sean claras.",
            })}
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-soft md:p-9">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-moss/8 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-moss">
                  {text({ en: "Business leadership", es: "Liderazgo empresarial" })}
                </p>
                <h2 className="mt-4 text-4xl md:text-5xl">{businessLeader.name}</h2>
                <p className="mt-3 text-sm font-semibold text-ink">{text(businessLeader.role)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{businessLeader.company}</p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-moss/25 bg-moss/8 px-4 py-2 text-xs font-semibold text-moss">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  <span>{text(businessLeader.credential)}</span>
                </div>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {text(businessLeader.bio)}
                </p>

                <p className="mt-6 border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
                  {text({
                    en: "Credential language is presented exactly as provided. The website does not represent Tranquility Level Cleaning as OSHA certified, licensed, approved, or accredited as an organization.",
                    es: "La credencial se presenta exactamente como fue proporcionada. El sitio no representa a Tranquility Level Cleaning como una organización certificada, licenciada, aprobada o acreditada por OSHA.",
                  })}
                </p>
              </div>
            </article>

            <article className="brand-dark relative overflow-hidden rounded-[2rem] border border-white/10 bg-night p-7 text-white shadow-lift md:p-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_6%,rgba(143,215,209,0.18),transparent_30%)]" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center gap-2 text-gold-soft">
                  <Code2 className="size-4" aria-hidden="true" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]">{text(attribution.technologyHeading)}</p>
                </div>
                <h2 className="mt-4 text-3xl text-white md:text-4xl">{technologyLeader.name}</h2>
                <p className="mt-3 text-sm font-semibold text-white">{text(technologyLeader.role)}</p>
                <p className="mt-1 text-sm text-white/70">{technologyLeader.company}</p>
                <p className="mt-3 text-sm font-medium text-gold-soft">{text(technologyLeader.designation)}</p>
                <p className="mt-6 text-sm leading-7 text-white/72">{text(technologyLeader.bio)}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {technologyLeader.disciplines.slice(0, 6).map((discipline) => (
                    <span key={discipline.en} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-medium text-white/72">
                      {text(discipline)}
                    </span>
                  ))}
                </div>

                <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-white/58">
                  {text({
                    en: "Express Development Inc. is credited for the digital experience and technology work only. It is not represented as an owner or operator of Tranquility Level Cleaning.",
                    es: "Express Development Inc. recibe crédito únicamente por la experiencia digital y el trabajo tecnológico. No se representa como propietario ni operador de Tranquility Level Cleaning.",
                  })}
                </p>
              </div>
            </article>
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
