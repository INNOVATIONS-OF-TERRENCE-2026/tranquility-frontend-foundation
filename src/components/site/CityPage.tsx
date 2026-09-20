import { Link } from "@tanstack/react-router";
import { CalendarCheck, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { money, services, servicePrice } from "@/config/pricing";

export interface CityPageProps {
  city: string;
  intro: { en: string; es: string };
  neighborhoods: string[];
  nearby: { label: string; to: string }[];
}

const serviceNames: Record<string, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
};

export function CityPage({ city, intro, neighborhoods, nearby }: CityPageProps) {
  const { text } = useLanguage();
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${city}, Texas`)}&z=12&output=embed`;

  return (
    <>
      <PageHero
        eyebrow={text({ en: `${city}, Texas`, es: `${city}, Texas` })}
        title={text({
          en: `House cleaning in ${city}`,
          es: `Limpieza de casas en ${city}`,
        })}
        intro={text(intro)}
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <SectionHeading
              eyebrow={text({ en: "Services", es: "Servicios" })}
              title={text({
                en: `Cleaning options for ${city} homes`,
                es: `Opciones de limpieza para casas en ${city}`,
              })}
              intro={text({
                en: "Every price below is a starting point for a one bedroom, one full bath home. Your estimate adjusts to the rooms and add-ons you choose.",
                es: "Cada precio es un punto de partida para una casa de una recámara y un baño completo. Tu estimado se ajusta según las habitaciones y extras que elijas.",
              })}
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-soft"
                >
                  <Sparkles className="size-5 text-gold" aria-hidden="true" />
                  <h3 className="mt-3 text-xl">{text(service.name)}</h3>
                  <p className="mt-2 font-display text-3xl text-ink">
                    {money(servicePrice(service.id, "onetime"))}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {text({ en: "Starting price", es: "Precio inicial" })}
                  </p>
                  <Link
                    to={serviceLinks[service.id] ?? "/services"}
                    className="mt-4 inline-flex text-sm font-semibold text-moss underline-offset-4 hover:underline"
                  >
                    {text({ en: "See what is included", es: "Ver lo que incluye" })}
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-border bg-sand/70 p-6">
              <h3 className="text-xl">
                {text({
                  en: `Areas we serve around ${city}`,
                  es: `Zonas que atendemos cerca de ${city}`,
                })}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {neighborhoods.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                {text({
                  en: "Coverage is confirmed once you share the service address.",
                  es: "La cobertura se confirma cuando compartes la dirección del servicio.",
                })}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6">
                <ShieldCheck className="size-5 text-moss" aria-hidden="true" />
                <h3 className="mt-3 text-lg">
                  {text({ en: "Careful, consistent work", es: "Trabajo cuidadoso y constante" })}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text({
                    en: "Locally owned and operated, with the same checklist used on every visit so your home is left the way you expect.",
                    es: "Empresa local con la misma lista de verificación en cada visita para que tu casa quede como esperas.",
                  })}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <CalendarCheck className="size-5 text-moss" aria-hidden="true" />
                <h3 className="mt-3 text-lg">
                  {text({ en: "Weekday arrival windows", es: "Horarios entre semana" })}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text({
                    en: "Choose 8 to 11 AM, 11 AM to 2 PM, or 2 to 5 PM on the booking calendar and we confirm the details with you.",
                    es: "Elige de 8 a 11 AM, de 11 AM a 2 PM o de 2 a 5 PM en el calendario y confirmamos los detalles contigo.",
                  })}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <iframe
                title={text({
                  en: `Map of ${city}, Texas`,
                  es: `Mapa de ${city}, Texas`,
                })}
                src={mapUrl}
                loading="lazy"
                className="h-64 w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <MapPin className="size-4 text-moss" aria-hidden="true" /> {city}, Texas
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild>
                    <Link to="/booking">
                      {text({ en: "Book a cleaning", es: "Reservar una limpieza" })}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={business.phoneHref}>
                      <Phone /> {business.phoneDisplay}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">
                {text({ en: "Nearby cities", es: "Ciudades cercanas" })}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {nearby.map((item) => (
                  <li key={item.to}>
                    <a
                      href={item.to}
                      className="font-semibold text-foreground underline-offset-4 hover:text-ink hover:underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    to="/service-area"
                    className="font-semibold text-moss underline-offset-4 hover:underline"
                  >
                    {text({ en: "See the full service area", es: "Ver toda el área de servicio" })}
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
