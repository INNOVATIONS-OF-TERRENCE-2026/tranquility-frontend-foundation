import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, FileText, Home as HomeIcon, MapPin, PackageOpen } from "lucide-react";

import { uploadedBrandHero } from "@/assets/uploadedImages";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import { business, cities } from "@/config/business";
import { frequencies, money, services, servicePrice, type FrequencyId, type ServiceId } from "@/config/pricing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Tranquility Level Cleaning | Premium Cleaning in Dallas-Fort Worth",
      description:
        "A cleaner space. A brighter you. Premium residential, deep, move-in, move-out, and commercial cleaning across Dallas-Fort Worth.",
      path: "/",
    }),
  component: Home,
});

const serviceNames: Record<ServiceId, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out", es: "Mudanza: entrada / salida" },
};

const frequencyNames: Record<FrequencyId, { en: string; es: string }> = {
  onetime: { en: "One-time", es: "Una vez" },
  weekly: { en: "Weekly", es: "Semanal" },
  biweekly: { en: "Bi-weekly", es: "Cada dos semanas" },
  monthly: { en: "Monthly", es: "Mensual" },
};

function Home() {
  const { text } = useLanguage();

  const heroServices = [
    {
      icon: HomeIcon,
      label: text({ en: "Residential", es: "Residencial" }),
      note: text({ en: "Clean homes. Brighter days.", es: "Hogares limpios. Días mejores." }),
      to: "/residential-cleaning" as const,
    },
    {
      icon: Building2,
      label: text({ en: "Commercial", es: "Comercial" }),
      note: text({ en: "Clean workspaces. Higher productivity.", es: "Espacios limpios. Más productividad." }),
      to: "/commercial-cleaning" as const,
    },
    {
      icon: PackageOpen,
      label: text({ en: "Move-In / Move-Out", es: "Entrada / salida" }),
      note: text({ en: "Fresh starts. Done right.", es: "Nuevos comienzos. Bien hechos." }),
      to: "/move-in-move-out-cleaning" as const,
    },
    {
      icon: FileText,
      label: text({ en: "Custom Care", es: "Servicio personalizado" }),
      note: text({ en: "Tailored consultation and quote.", es: "Consulta y cotización a tu medida." }),
      to: "/quote" as const,
    },
  ];

  return (
    <>
      <section className="brand-dark relative overflow-hidden bg-night text-night-foreground">
        <div className="relative isolate min-h-[42rem] overflow-hidden md:min-h-[46rem] lg:min-h-[39rem] xl:min-h-[42rem]">
          <div className="absolute inset-y-0 right-0 w-full overflow-hidden sm:w-[76%] lg:w-[66%]" aria-hidden="true">
            <img
              src={uploadedBrandHero}
              alt=""
              className="h-full w-full object-cover object-center opacity-90"
              style={{ imageRendering: "auto" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--night)_0%,color-mix(in_srgb,var(--night)_88%,transparent)_18%,color-mix(in_srgb,var(--night)_35%,transparent)_58%,color-mix(in_srgb,var(--night)_12%,transparent)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--night)_45%,transparent)_0%,transparent_24%,transparent_72%,color-mix(in_srgb,var(--night)_55%,transparent)_100%)]" />
          </div>

          <div className="absolute inset-0 -z-10 bg-night" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,color-mix(in_srgb,var(--gold)_16%,transparent),transparent_26%)]" aria-hidden="true" />

          <div className="container-page relative z-10 flex min-h-[42rem] items-center pb-14 pt-32 md:min-h-[46rem] md:pb-16 md:pt-36 lg:min-h-[39rem] lg:pt-28 xl:min-h-[42rem]">
            <div className="w-full max-w-[43rem] lg:w-[49%]">
              <div className="mb-5 h-px w-72 max-w-full bg-[linear-gradient(90deg,var(--gold),transparent)]" aria-hidden="true" />
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.32em] text-gold-soft sm:text-xs">
                {text({ en: "Premium Cleaning Services", es: "Servicios premium de limpieza" })}
              </p>

              <h1 className="mt-5 max-w-[11ch] font-display text-[clamp(3.15rem,6.2vw,5.35rem)] font-medium leading-[0.92] tracking-[-0.045em] text-white">
                {text({ en: "A Cleaner Space.", es: "Un espacio más limpio." })}
                <span className="gold-text block">
                  {text({ en: "A Brighter You.", es: "Una vida más ligera." })}
                </span>
              </h1>

              <p className="mt-6 max-w-[42rem] text-[0.65rem] font-semibold uppercase leading-5 tracking-[0.14em] text-white/78 sm:text-xs">
                {text({ en: "Residential", es: "Residencial" })}
                <span className="mx-2 text-gold/65">|</span>
                {text({ en: "Commercial", es: "Comercial" })}
                <span className="mx-2 text-gold/65">|</span>
                {text({ en: "Move-In / Move-Out", es: "Entrada / salida" })}
                <span className="mx-2 text-gold/65">|</span>
                {text({ en: "Custom Care", es: "Servicio personalizado" })}
              </p>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/78 md:text-base">
                {text({
                  en: "Flexible cleaning solutions designed around your space, your lifestyle, and your standards.",
                  es: "Soluciones flexibles de limpieza diseñadas alrededor de tu espacio, tu estilo de vida y tus estándares.",
                })}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="min-w-52 justify-between px-7">
                  <Link to="/booking">
                    {text({ en: "Book Your Clean", es: "Reserva tu limpieza" })}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-w-56 justify-between border-gold/60 bg-night/45 px-7 text-white backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:text-white"
                >
                  <Link to="/quote">
                    {text({ en: "Custom Quote", es: "Cotización personalizada" })}
                    <FileText className="size-4 text-gold-soft" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 border-y border-gold/30 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--night)_98%,black),color-mix(in_srgb,var(--navy-soft)_88%,black),color-mix(in_srgb,var(--night)_98%,black))]">
          <div className="container-page grid sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.35fr_1fr]">
            {heroServices.map(({ icon: Icon, label, note, to }) => (
              <Link key={label} to={to} className="group flex min-h-28 items-center gap-4 border-b border-gold/20 px-4 py-5 transition-colors hover:bg-white/[0.035] sm:border-r lg:border-b-0">
                <span className="flex size-11 shrink-0 items-center justify-center text-gold-soft">
                  <Icon className="size-8 stroke-[1.35]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.11em] text-white">{label}</span>
                  <span className="mt-2 block max-w-40 text-[0.56rem] font-medium uppercase leading-4 tracking-[0.13em] text-white/58">{note}</span>
                </span>
              </Link>
            ))}

            <div className="hidden min-h-28 items-center justify-center border-r border-gold/20 px-5 text-center lg:flex">
              <div>
                <p className="font-display text-[1.8rem] italic leading-none text-gold-soft">
                  {text({ en: "More Than Clean.", es: "Más que limpieza." })}
                </p>
                <div className="mx-auto mt-3 h-px w-40 bg-[linear-gradient(90deg,transparent,var(--gold),transparent)]" aria-hidden="true" />
                <p className="mt-3 text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-white/58">
                  {text({ en: "It is a feeling.", es: "Es una sensación." })}
                </p>
              </div>
            </div>

            <Link to="/service-area" className="hidden min-h-28 items-center justify-center gap-3 px-4 text-center transition-colors hover:bg-white/[0.035] lg:flex">
              <MapPin className="size-6 shrink-0 text-gold-soft" aria-hidden="true" />
              <span>
                <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white">Dallas - Fort Worth</span>
                <span className="mt-2 block text-[0.52rem] uppercase tracking-[0.12em] text-white/48">
                  {text({ en: "Serving homes and businesses", es: "Servicio para hogares y negocios" })}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="section bg-background">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">{text({ en: "Clear Pricing", es: "Precios claros" })}</p>
            <h2 className="mt-4 text-4xl md:text-5xl">
              {text({ en: "Premium care with a visible starting point.", es: "Cuidado premium con un precio inicial visible." })}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              {text({
                en: "Residential pricing begins with a standard average 1-bedroom, 1-full-bath home. Recurring service lowers the service subtotal while approved add-ons remain visible.",
                es: "Los precios residenciales parten de una vivienda estándar promedio de 1 dormitorio y 1 baño completo. El servicio recurrente reduce el subtotal del servicio, mientras que los servicios adicionales aprobados permanecen visibles.",
              })}
            </p>
            <Button asChild className="mt-7">
              <Link to="/services">{text({ en: "Explore Services", es: "Explorar servicios" })} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-moss">{text(serviceNames[service.id])}</p>
                <p className="mt-5 font-display text-5xl text-ink">{money(service.basePrice)}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {text({ en: "One-time starting price for the standard base scope.", es: "Precio inicial por una sola visita para el alcance base estándar." })}
                </p>
                <div className="mt-6 space-y-2 border-t border-border pt-5">
                  {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                    <div key={frequency.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{text(frequencyNames[frequency.id])}</span>
                      <span className="font-semibold tabular-nums text-ink">{money(servicePrice(service.id, frequency.id))}</span>
                    </div>
                  ))}
                </div>
                <Link to="/booking" search={{ service: service.id }} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">
                  {text({ en: "Request this clean", es: "Solicitar esta limpieza" })} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow">{text({ en: "Service Area", es: "Área de servicio" })}</p>
            <h2 className="mt-4 text-4xl md:text-5xl">{text({ en: "Dallas - Fort Worth and surrounding communities.", es: "Dallas - Fort Worth y comunidades cercanas." })}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              {text({
                en: "Search our service-area tool to explore core cities, mileage radius options, and the interactive map.",
                es: "Usa nuestra herramienta de área de servicio para explorar las ciudades principales, las opciones de radio por millas y el mapa interactivo.",
              })}
            </p>
            <Button asChild variant="outline" className="mt-7"><Link to="/service-area">{text({ en: "Open Service Area Map", es: "Abrir mapa del área de servicio" })}</Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cities.slice(0, 12).map((city) => (
              <div key={city} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-soft">
                <MapPin className="size-4 text-moss" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark bg-night py-12 text-night-foreground">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.25em] text-gold-soft">{text({ en: "Come Home to Tranquility", es: "Vuelve a casa con tranquilidad" })}</p>
            <h2 className="mt-3 text-3xl text-white md:text-4xl">{text({ en: "Ready for a cleaner space and a calmer day?", es: "¿Listo para un espacio más limpio y un día más tranquilo?" })}</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/booking">{text({ en: "Book Your Clean", es: "Reserva tu limpieza" })}</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-gold/45 text-white hover:bg-gold/10 hover:text-white"><a href={business.phoneHref}>{text({ en: "Call", es: "Llama al" })} {business.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}
