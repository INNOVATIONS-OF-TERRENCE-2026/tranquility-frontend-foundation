import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { services, servicePrice } from "@/config/pricing";

type CityPath =
  | "/house-cleaning-euless"
  | "/house-cleaning-bedford"
  | "/house-cleaning-hurst"
  | "/house-cleaning-colleyville"
  | "/house-cleaning-grapevine";

export type CityGuide = {
  slug: string;
  name: string;
  intro: string;
  introEs: string;
  neighborhoods: string[];
  nearby: { to: CityPath; name: string }[];
};

export function CityPage({ city }: { city: CityGuide }) {
  const { text } = useLanguage();
  return (
    <>
      <PageHero
        eyebrow={text({ en: "House cleaning", es: "Limpieza de hogar" })}
        title={text({
          en: `House cleaning in ${city.name}, Texas`,
          es: `Limpieza de hogar en ${city.name}, Texas`,
        })}
        intro={text({ en: city.intro, es: city.introEs })}
      />

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Services", es: "Servicios" })}
            title={text({
              en: `Cleaning services available in ${city.name}`,
              es: `Servicios de limpieza disponibles en ${city.name}`,
            })}
            intro={text({
              en: "Every visit follows the same detailed checklist used across Dallas-Fort Worth. Prices below are starting rates for a one-time visit.",
              es: "Cada visita sigue la misma lista detallada que usamos en Dallas-Fort Worth. Los precios siguientes son tarifas iniciales para una visita única.",
            })}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <h3 className="font-display text-2xl text-ink">{service.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.short}</p>
                <p className="mt-4 text-lg font-semibold text-ink">
                  {text({ en: "From", es: "Desde" })} ${servicePrice(service.id, "onetime")}
                </p>
                <Button asChild className="mt-5">
                  <Link to="/booking">
                    {text({ en: "Book this service", es: "Reservar este servicio" })}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={text({ en: "Local coverage", es: "Cobertura local" })}
              title={text({
                en: `Neighborhoods we serve in ${city.name}`,
                es: `Vecindarios que servimos en ${city.name}`,
              })}
            />
            <ul className="mt-6 flex flex-wrap gap-2">
              {city.neighborhoods.map((hood) => (
                <li
                  key={hood}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-ink"
                >
                  {hood}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-xl text-ink">
                {text({ en: "Careful work, clear windows", es: "Trabajo cuidadoso, horarios claros" })}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text({
                  en: "Weekday visits with three arrival windows: 8 to 11 AM, 11 AM to 2 PM, and 2 to 5 PM. You receive a written estimate before any work begins.",
                  es: "Visitas entre semana con tres horarios de llegada: 8 a 11 AM, 11 AM a 2 PM y 2 a 5 PM. Recibes un estimado por escrito antes de comenzar cualquier trabajo.",
                })}
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
            <iframe
              title={text({
                en: `Map of ${city.name}, Texas`,
                es: `Mapa de ${city.name}, Texas`,
              })}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${city.name}, Texas`)}&z=11&output=embed`}
              className="h-full min-h-80 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {city.nearby.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading
              eyebrow={text({ en: "Nearby cities", es: "Ciudades cercanas" })}
              title={text({
                en: "Also serving nearby communities",
                es: "También servimos comunidades cercanas",
              })}
            />
            <ul className="mt-6 flex flex-wrap gap-3">
              {city.nearby.map((item) => (
                <li key={item.to}>
                  <Button asChild variant="outline">
                    <Link to={item.to}>
                      <MapPin /> {item.name}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CTABand
        title={`Book a cleaning in ${city.name}`}
        titleEs={`Reserva una limpieza en ${city.name}`}
        intro="Pick a weekday arrival window that fits your schedule, or call with questions about your home."
        introEs="Elige un horario de llegada entre semana que se ajuste a tu día, o llámanos si tienes preguntas sobre tu hogar."
      />
      <div className="container-page pb-10">
        <Button asChild variant="outline">
          <a href={business.phoneHref}>
            <Phone /> {business.phoneDisplay}
          </a>
        </Button>
      </div>
    </>
  );
}
