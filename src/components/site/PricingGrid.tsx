import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  frequencies,
  money,
  services,
  servicePrice,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";

const serviceNames: Record<ServiceId, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
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

export function PricingGrid({ highlight }: { highlight?: ServiceId }) {
  const { text } = useLanguage();

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {services.map((service, index) => {
          const isHighlight = highlight === service.id;
          return (
            <article
              key={service.id}
              className={`relative flex min-h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift ${isHighlight ? "border-gold" : "border-border"}`}
            >
              <div className="absolute inset-x-0 top-0 h-px gold-rule" aria-hidden="true" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-moss">0{index + 1}</p>
                  <h3 className="mt-2 text-2xl">{text(serviceNames[service.id])}</h3>
                </div>
                <span className="rounded-full border border-gold/25 bg-accent/45 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {text({ en: "Starting price", es: "Precio inicial" })}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {text({ en: "Standard average 1 bed / 1 full bath home", es: "Vivienda estándar promedio de 1 dormitorio / 1 baño completo" })}
              </p>
              <p className="mt-7 font-display text-5xl text-ink">{money(service.basePrice)}</p>
              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.17em] text-muted-foreground">
                {text({ en: "One-time base price", es: "Precio base por una sola visita" })}
              </p>

              <dl className="mt-7 space-y-3 border-t border-border pt-5 text-sm">
                {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                  <div key={frequency.id} className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">
                      {text(frequencyNames[frequency.id])}{" "}
                      <span className="text-xs font-semibold text-moss">{text(frequencyNotes[frequency.id])}</span>
                    </dt>
                    <dd className="font-semibold tabular-nums text-ink">{money(servicePrice(service.id, frequency.id))}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link to="/booking" search={{ service: service.id }}>
                    {text({ en: "Request this service", es: "Solicitar este servicio" })} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to={service.route}>{text({ en: "See what is included", es: "Ver qué incluye" })}</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/45 px-5 py-4">
        <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
          {text({
            en: "Pricing shown is based on a standard average 1-bedroom, 1-full-bath home. Your final price can change based on square footage, layout, condition, customizations, unusual scope, or specialty work. Final service details are confirmed with you before any cleaning takes place. Recurring savings apply to the service price only, not to add-ons.",
            es: "Los precios mostrados se basan en una vivienda estándar promedio de 1 dormitorio y 1 baño completo. El precio final puede cambiar según los pies cuadrados, la distribución, la condición, las personalizaciones, un alcance inusual o trabajo especializado. Los detalles finales del servicio se confirman contigo antes de realizar cualquier limpieza. Los descuentos recurrentes se aplican solo al precio del servicio, no a los servicios adicionales.",
          })}
        </p>
      </div>
    </div>
  );
}
