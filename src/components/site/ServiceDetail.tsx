import { Link } from "@tanstack/react-router";
import { Check, FileText } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  frequencies,
  getService,
  money,
  servicePrice,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";
import { CTABand } from "./CTABand";
import { PageHero, SectionHeading } from "./PageHero";

interface ServiceDetailProps {
  serviceId: ServiceId;
  eyebrow: string;
  eyebrowEs?: string;
  intro: string;
  introEs?: string;
  bestFor: string[];
  bestForEs?: string[];
  notes?: string;
  notesEs?: string;
}

const serviceNames: Record<ServiceId, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
};

const descriptions: Record<ServiceId, { en: string; es: string }> = {
  standard: {
    en: "Consistent upkeep for a home that already feels cared for. Surfaces, floors, kitchen, and bath are refreshed on a rhythm that suits you.",
    es: "Mantenimiento constante para un hogar que ya recibe cuidado regular. Renovamos superficies, pisos, cocina y baño con la frecuencia que mejor se adapte a ti.",
  },
  deep: {
    en: "A detailed reset for homes that need more attention, including build-up, edges, and the places routine cleaning tends to pass over.",
    es: "Una renovación detallada para hogares que necesitan más atención, incluyendo acumulación, bordes y áreas que una limpieza rutinaria suele pasar por alto.",
  },
  move: {
    en: "An empty-home clean for transitions, whether you are handing keys over or walking into a space that should feel genuinely new.",
    es: "Una limpieza para viviendas vacías o casi vacías durante una mudanza, ya sea que entregues las llaves o llegues a un espacio que debe sentirse verdaderamente renovado.",
  },
};

const includesEs: Record<ServiceId, string[]> = {
  standard: [
    "Superficies de cocina, exterior de electrodomésticos y fregadero",
    "Lavabo, inodoro, tina o ducha y espejos del baño",
    "Limpieza de polvo en superficies y accesorios alcanzables",
    "Aspirado y trapeado de pisos",
    "Retiro de basura y acabado ordenado",
  ],
  deep: [
    "Todo lo incluido en la limpieza estándar, con mayor detalle",
    "Trabajo detallado en bordes, esquinas y molduras alcanzables",
    "Atención a la acumulación en cocina y baño",
    "Limpieza manual detallada de accesorios y superficies alcanzables",
    "Revisión final cuidadosa habitación por habitación",
  ],
  move: [
    "Limpieza detallada de toda la vivienda vacía o casi vacía",
    "Limpieza detallada de cocina y baños",
    "Limpieza de polvo y superficies y accesorios alcanzables",
    "Aspirado y trapeado de pisos",
    "Revisión final habitación por habitación",
  ],
};

const frequencyNames: Record<FrequencyId, { en: string; es: string }> = {
  onetime: { en: "One-time", es: "Una vez" },
  weekly: { en: "Weekly", es: "Semanal" },
  biweekly: { en: "Bi-weekly", es: "Cada dos semanas" },
  monthly: { en: "Monthly", es: "Mensual" },
};

const frequencyNotes: Record<FrequencyId, { en: string; es: string }> = {
  onetime: { en: "No commitment", es: "Sin compromiso" },
  weekly: { en: "20% savings", es: "20% de ahorro" },
  biweekly: { en: "15% savings", es: "15% de ahorro" },
  monthly: { en: "10% savings", es: "10% de ahorro" },
};

export function ServiceDetail({
  serviceId,
  eyebrow,
  eyebrowEs,
  intro,
  introEs,
  bestFor,
  bestForEs,
  notes,
  notesEs,
}: ServiceDetailProps) {
  const service = getService(serviceId);
  const { language, text } = useLanguage();
  const localizedBestFor = language === "es" ? bestForEs ?? bestFor : bestFor;
  const localizedNotes = language === "es" ? notesEs ?? notes : notes;

  return (
    <>
      <PageHero
        eyebrow={language === "es" ? eyebrowEs ?? eyebrow : eyebrow}
        title={text(serviceNames[service.id])}
        intro={language === "es" ? introEs ?? intro : intro}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link to="/booking" search={{ service: service.id }}>{text({ en: "Request this service", es: "Solicitar este servicio" })}</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/quote">{text({ en: "Get a custom quote", es: "Solicitar cotización personalizada" })}</Link></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading title={text({ en: "What this service covers", es: "Qué incluye este servicio" })} intro={text(descriptions[service.id])} />
            <ul className="mt-8 space-y-3">
              {(language === "es" ? includesEs[service.id] : service.includes).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />{item}
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-xl">{text({ en: "Best suited for", es: "Ideal para" })}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {localizedBestFor.map((item) => <li key={item}>• {item}</li>)}
            </ul>

            {localizedNotes && <p className="mt-8 border-l-2 border-moss bg-sand/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{localizedNotes}</p>}

            <div className="mt-10 border-t border-border pt-8">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
                <div>
                  <h3 className="text-2xl">{text({ en: "Need a nonstandard scope?", es: "¿Necesitas un alcance fuera de lo estándar?" })}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {text({
                      en: "Large homes, partial-home requests, specialty surfaces, and unusual conditions can be reviewed through a direct custom quote so the scope reflects the actual work.",
                      es: "Las viviendas grandes, las solicitudes para limpiar solo parte del hogar, las superficies especiales y las condiciones inusuales pueden revisarse mediante una cotización personalizada para que el alcance refleje el trabajo real.",
                    })}
                  </p>
                  <Link to="/quote" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-moss hover:underline">{text({ en: "Request a custom quote", es: "Solicitar cotización personalizada" })}</Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <p className="eyebrow">{text({ en: "Pricing", es: "Precios" })}</p>
            <p className="mt-3 font-display text-4xl text-ink">{money(service.basePrice)}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{text({ en: "One-time, standard average 1 bed / 1 bath home", es: "Una visita, vivienda estándar promedio de 1 dormitorio / 1 baño" })}</p>
            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                <div key={frequency.id} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{text(frequencyNames[frequency.id])} <span className="text-xs text-moss">({text(frequencyNotes[frequency.id])})</span></dt>
                  <dd className="font-semibold text-ink">{money(servicePrice(service.id, frequency.id))}</dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-6 w-full"><Link to="/booking" search={{ service: service.id }}>{text({ en: "Build my estimate", es: "Calcular mi estimado" })}</Link></Button>
            <Button asChild variant="secondary" className="mt-2 w-full"><Link to="/quote">{text({ en: "Custom quote", es: "Cotización personalizada" })}</Link></Button>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {text({
                en: "Pricing shown is based on a standard average 1-bedroom, 1-full-bath home. Final pricing can change based on square footage, layout, condition, customizations, unusual scope, or specialty work.",
                es: "Los precios mostrados se basan en una vivienda estándar promedio de 1 dormitorio y 1 baño completo. El precio final puede cambiar según los pies cuadrados, la distribución, la condición, las personalizaciones, un alcance inusual o trabajo especializado.",
              })}
            </p>
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
