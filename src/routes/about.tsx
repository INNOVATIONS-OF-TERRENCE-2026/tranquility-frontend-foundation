import { createFileRoute } from "@tanstack/react-router";
import { Heart, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { businessLeader } from "@/config/leadership";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Treva Williams | Tranquility Level Cleaning",
      description:
        "Meet Treva Williams, Dallas-born Founder and Owner of Tranquility Level Cleaning, and learn the service story behind the business.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  const { text } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Behind the business", es: "Detrás del negocio" })}
        title={text({
          en: "Built from service, purpose, and a genuine love of helping people.",
          es: "Creado desde el servicio, el propósito y un amor genuino por ayudar a las personas.",
        })}
        intro={text({
          en: "Tranquility Level Cleaning grew from one simple realization: the work Treva Williams naturally loved doing could also become a meaningful way to care for people and build something of her own.",
          es: "Tranquility Level Cleaning nació de una idea sencilla: el trabajo que Treva Williams amaba hacer de forma natural también podía convertirse en una manera significativa de cuidar a las personas y construir algo propio.",
        })}
      />

      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
              <aside className="border-b border-border bg-sand p-7 lg:border-b-0 lg:border-r lg:p-9">
                <div className="flex size-12 items-center justify-center rounded-full bg-background text-moss shadow-soft">
                  <Heart className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-7 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-moss">
                  {text({ en: "Founder story", es: "Historia de la fundadora" })}
                </p>
                <h2 className="mt-3 text-4xl text-ink">{businessLeader.name}</h2>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {text(businessLeader.role)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{businessLeader.company}</p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-moss/25 bg-background px-4 py-2 text-xs font-semibold text-moss">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  <span>{text(businessLeader.credential)}</span>
                </div>

                <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
                    <span>{text({ en: "Born and raised in Dallas, Texas", es: "Nacida y criada en Dallas, Texas" })}</span>
                  </div>
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                    <span>{text({ en: "Freelancing since 2019", es: "Trabajando de forma independiente desde 2019" })}</span>
                  </div>
                </div>
              </aside>

              <article className="p-7 md:p-10 lg:p-12">
                <p className="text-lg leading-8 text-foreground md:text-xl md:leading-9">
                  {text({
                    en: "Born and raised in Dallas, Treva Williams always knew two things about herself: she loved to clean, and she loved helping people.",
                    es: "Nacida y criada en Dallas, Treva Williams siempre supo dos cosas sobre sí misma: le encantaba limpiar y le encantaba ayudar a las personas.",
                  })}
                </p>

                <div className="mt-7 space-y-5 text-base leading-8 text-muted-foreground">
                  <p>
                    {text({
                      en: "Before Tranquility Level Cleaning became a business, Treva volunteered cleaning services and worked for a company that offered a range of support services for disabled people, individuals with mobility limitations, and veterans. Of all the ways she could help, cleaning was the work she connected with most.",
                      es: "Antes de que Tranquility Level Cleaning se convirtiera en un negocio, Treva ofrecía servicios de limpieza como voluntaria y trabajaba para una empresa que brindaba distintos tipos de apoyo a personas con discapacidades, limitaciones de movilidad y veteranos. De todas las formas en que podía ayudar, la limpieza fue el trabajo con el que más conectó.",
                    })}
                  </p>
                  <p>
                    {text({
                      en: "She had also always wanted to become an entrepreneur. That experience became the light bulb moment she believes God placed in front of her. In 2019, just before the COVID-19 pandemic, Treva began freelancing. By grace, the work remained steady.",
                      es: "También siempre había querido convertirse en emprendedora. Esa experiencia se convirtió en el momento de claridad que ella cree que Dios puso en su camino. En 2019, justo antes de la pandemia de COVID-19, Treva comenzó a trabajar de forma independiente. Por gracia, el trabajo se mantuvo constante.",
                    })}
                  </p>
                  <p>
                    {text({
                      en: "Instead of rushing the growth of the company, she chose patience. She continued listening for direction on how the business should grow and how to steward it well. Over time, new ideas, relationships, clients, and business opportunities continued to meet her along the way.",
                      es: "En lugar de apresurar el crecimiento de la empresa, eligió la paciencia. Continuó buscando dirección sobre cómo debía crecer el negocio y cómo administrarlo con responsabilidad. Con el tiempo, nuevas ideas, relaciones, clientes y oportunidades de negocio continuaron apareciendo en su camino.",
                    })}
                  </p>
                </div>

                <blockquote className="mt-9 rounded-[1.5rem] border border-gold/30 bg-gold/5 p-6 md:p-7">
                  <p className="font-display text-2xl leading-relaxed text-ink md:text-3xl">
                    {text({
                      en: "My vision is to provide service with the utmost integrity, in a way that is commendable and shines light on the gift I have been entrusted with.",
                      es: "Mi visión es brindar un servicio con la máxima integridad, de una manera digna de reconocimiento y que refleje el don que me ha sido confiado.",
                    })}
                  </p>
                  <footer className="mt-4 text-sm font-semibold text-moss">Treva Williams</footer>
                </blockquote>

                <p className="mt-7 text-xs leading-6 text-muted-foreground">
                  {text({
                    en: "Treva's OSHA Compliance Certified credential is presented as her individual professional credential. Tranquility Level Cleaning is not represented as OSHA licensed, approved, accredited, or certified as an organization.",
                    es: "La credencial de Treva como Certificada en Cumplimiento de OSHA se presenta como su credencial profesional individual. Tranquility Level Cleaning no se presenta como una organización licenciada, aprobada, acreditada o certificada por OSHA.",
                  })}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
