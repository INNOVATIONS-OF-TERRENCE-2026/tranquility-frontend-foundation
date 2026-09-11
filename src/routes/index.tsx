import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  Droplets,
  FileText,
  Home as HomeIcon,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Waves,
  Wind,
} from "lucide-react";

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
        "Premium residential, deep, move-in, move-out, and commercial cleaning across Dallas-Fort Worth with clear pricing and thoughtful care.",
      path: "/",
    }),
  component: Home,
});

const serviceNames: Record<ServiceId, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out", es: "Entrada / salida" },
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
      note: text({ en: "Routine care for calmer homes.", es: "Cuidado regular para hogares más tranquilos." }),
      to: "/residential-cleaning" as const,
    },
    {
      icon: Building2,
      label: text({ en: "Commercial", es: "Comercial" }),
      note: text({ en: "Thoughtful care for workspaces.", es: "Cuidado profesional para espacios de trabajo." }),
      to: "/commercial-cleaning" as const,
    },
    {
      icon: PackageOpen,
      label: text({ en: "Move-In / Move-Out", es: "Entrada / salida" }),
      note: text({ en: "Fresh starts handled carefully.", es: "Nuevos comienzos tratados con cuidado." }),
      to: "/move-in-move-out-cleaning" as const,
    },
    {
      icon: FileText,
      label: text({ en: "Custom Care", es: "Servicio personalizado" }),
      note: text({ en: "Consultation for unusual scope.", es: "Consulta para alcances especiales." }),
      to: "/quote" as const,
    },
  ];

  return (
    <>
      <section className="brand-dark relative isolate overflow-hidden bg-night text-night-foreground">
        <div
          className="absolute inset-0 -z-30"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 78% 12%, rgba(131, 218, 211, 0.24), transparent 26%), radial-gradient(circle at 18% 8%, rgba(255,255,255,0.10), transparent 20%), linear-gradient(135deg, #061923 0%, #0A2C37 46%, #0C4550 100%)",
          }}
        />
        <div
          className="absolute inset-0 -z-20 opacity-35"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(112deg, transparent 0 18px, rgba(255,255,255,0.055) 18px 19px, transparent 19px 42px)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[46%] bg-[linear-gradient(180deg,transparent,rgba(225,247,245,0.06)_35%,rgba(199,233,231,0.12)_100%)]" aria-hidden="true" />

        <div className="container-page grid min-h-[43rem] gap-10 pb-14 pt-28 md:min-h-[46rem] md:pt-32 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-28">
          <div className="max-w-3xl">
            <p className="max-w-xl text-[0.66rem] font-bold uppercase leading-5 tracking-[0.24em] text-gold-soft sm:text-[0.7rem]">
              {text({
                en: "Premium cleaning across Dallas - Fort Worth",
                es: "Limpieza premium en Dallas - Fort Worth",
              })}
            </p>

            <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(3.15rem,8vw,6rem)] font-medium leading-[0.93] tracking-[-0.045em] text-white">
              {text({ en: "Come home to a cleaner, calmer space.", es: "Vuelve a un hogar más limpio y tranquilo." })}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/76 md:text-lg md:leading-8">
              {text({
                en: "Clear pricing, careful service, and flexible options designed around the way your home is actually used.",
                es: "Precios claros, servicio cuidadoso y opciones flexibles diseñadas alrededor de la forma en que realmente usas tu hogar.",
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
                className="min-w-56 justify-between border-white/25 bg-white/6 px-7 text-white hover:border-white/45 hover:bg-white/10 hover:text-white"
              >
                <Link to="/quote">
                  {text({ en: "Get a Custom Quote", es: "Cotización personalizada" })}
                  <FileText className="size-4 text-gold-soft" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/68">
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-gold-soft" aria-hidden="true" />{text({ en: "Standard from $145", es: "Estándar desde $145" })}</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-gold-soft" aria-hidden="true" />{text({ en: "Weekly saves 20%", es: "Semanal ahorra 20%" })}</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-gold-soft" aria-hidden="true" />{text({ en: "DFW service area", es: "Área de servicio DFW" })}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[30rem] lg:max-w-[33rem]">
            <div className="absolute -inset-5 rounded-[2.5rem] border border-white/8 bg-white/[0.025]" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)] md:p-8">
              <div className="mx-auto size-48 overflow-hidden rounded-[2rem] border border-white/12 bg-black shadow-[0_22px_60px_-34px_rgba(0,0,0,0.9)] sm:size-56">
                <img src="/tranquility-official-logo.webp" alt="Tranquility Level Cleaning official logo" className="h-full w-full object-cover" width={256} height={256} decoding="async" />
              </div>
              <div className="mt-6 text-center">
                <p className="font-display text-3xl text-white">Tranquility Level Cleaning</p>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-gold-soft">{text({ en: "Clean spaces. Calmer days.", es: "Espacios limpios. Días más tranquilos." })}</p>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
                <div><Wind className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.6rem] uppercase tracking-[0.12em] text-white/58">{text({ en: "Calm", es: "Calma" })}</p></div>
                <div><Droplets className="mx-auto size-4 text-moss-soft" aria-hidden="true" /><p className="mt-2 text-[0.6rem] uppercase tracking-[0.12em] text-white/58">{text({ en: "Fresh", es: "Fresco" })}</p></div>
                <div><ShieldCheck className="mx-auto size-4 text-gold-soft" aria-hidden="true" /><p className="mt-2 text-[0.6rem] uppercase tracking-[0.12em] text-white/58">{text({ en: "Careful", es: "Cuidadoso" })}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-white/10 bg-black/14">
          <div className="container-page grid sm:grid-cols-2 lg:grid-cols-4">
            {heroServices.map(({ icon: Icon, label, note, to }) => (
              <Link key={label} to={to} className="group flex min-h-28 items-center gap-4 border-b border-white/8 px-4 py-5 transition-colors hover:bg-white/[0.035] sm:border-r lg:border-b-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-gold-soft">
                  <Icon className="size-6 stroke-[1.5]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white">{label}</span>
                  <span className="mt-2 block max-w-44 text-[0.58rem] font-medium uppercase leading-4 tracking-[0.1em] text-white/52">{note}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section bg-background">
        <div className="container-page grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{text({ en: "Clear Pricing", es: "Precios claros" })}</p>
            <h2 className="mt-4 max-w-xl text-4xl md:text-5xl">
              {text({ en: "Know the starting point before you book.", es: "Conoce el punto de partida antes de reservar." })}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              {text({
                en: "Residential pricing begins with a standard average 1-bedroom, 1-full-bath home. Recurring savings apply to the service subtotal only.",
                es: "Los precios residenciales parten de una vivienda estándar promedio de 1 dormitorio y 1 baño completo. Los ahorros por servicio recurrente se aplican solo al subtotal del servicio.",
              })}
            </p>
            <Button asChild className="mt-7"><Link to="/services">{text({ en: "Explore Services", es: "Explorar servicios" })}<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-moss">{text(serviceNames[service.id])}</p>
                <p className="mt-5 font-display text-5xl text-ink">{money(service.basePrice)}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text({ en: "One-time starting price for the standard base scope.", es: "Precio inicial por una sola visita para el alcance base estándar." })}</p>
                <div className="mt-6 space-y-2 border-t border-border pt-5">
                  {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                    <div key={frequency.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{text(frequencyNames[frequency.id])}</span>
                      <span className="font-semibold tabular-nums text-ink">{money(servicePrice(service.id, frequency.id))}</span>
                    </div>
                  ))}
                </div>
                <Link to="/booking" search={{ service: service.id }} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-moss hover:underline">
                  {text({ en: "Request this service", es: "Solicitar este servicio" })}<ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <Waves className="mx-auto size-7 text-moss" aria-hidden="true" />
            <p className="eyebrow mt-4">{text({ en: "A smoother experience", es: "Una experiencia más fluida" })}</p>
            <h2 className="mt-4 text-4xl md:text-5xl">{text({ en: "Simple choices. Thoughtful care. No clutter.", es: "Decisiones simples. Cuidado atento. Sin complicaciones." })}</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
              {text({
                en: "Choose the service you need, add only the rooms and extras that matter, then review the estimate before sending your request.",
                es: "Elige el servicio que necesitas, agrega solo las habitaciones y extras importantes, y revisa el estimado antes de enviar tu solicitud.",
              })}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: FileText, en: "Clear scope", es: "Alcance claro", bodyEn: "See what is included and what changes the price.", bodyEs: "Consulta qué está incluido y qué puede cambiar el precio." },
              { icon: ShieldCheck, en: "Thoughtful handling", es: "Cuidado atento", bodyEn: "Tell us about pets, surfaces, access, and special conditions.", bodyEs: "Cuéntanos sobre mascotas, superficies, acceso y condiciones especiales." },
              { icon: Wind, en: "Calm finish", es: "Resultado tranquilo", bodyEn: "The goal is a home that feels lighter when you return.", bodyEs: "El objetivo es un hogar que se sienta más ligero cuando regreses." },
            ].map(({ icon: Icon, en, es, bodyEn, bodyEs }) => (
              <article key={en} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-moss"><Icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl">{text({ en, es })}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text({ en: bodyEn, es: bodyEs })}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow">{text({ en: "Service Area", es: "Área de servicio" })}</p>
            <h2 className="mt-4 text-4xl md:text-5xl">{text({ en: "Dallas - Fort Worth and surrounding communities.", es: "Dallas - Fort Worth y comunidades cercanas." })}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              {text({
                en: "Search the service-area map, choose a city, and explore nearby listed communities by mileage radius.",
                es: "Busca en el mapa del área de servicio, elige una ciudad y explora comunidades cercanas por radio de millas.",
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

      <section className="brand-dark relative overflow-hidden bg-night py-14 text-night-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(143,215,209,0.16),transparent_26%)]" aria-hidden="true" />
        <div className="container-page relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.23em] text-gold-soft">{text({ en: "Come home to tranquility", es: "Vuelve a casa con tranquilidad" })}</p>
            <h2 className="mt-3 max-w-2xl text-3xl text-white md:text-4xl">{text({ en: "Ready for a cleaner space and a calmer day?", es: "¿Listo para un espacio más limpio y un día más tranquilo?" })}</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/booking">{text({ en: "Book Your Clean", es: "Reserva tu limpieza" })}</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/8 hover:text-white"><a href={business.phoneHref}>{text({ en: "Call", es: "Llamar" })} {business.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}
