import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, PackageOpen, Sparkles } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PricingGrid } from "@/components/site/PricingGrid";
import { Button } from "@/components/ui/button";
import { addOns, addOnPrice, money, services, type ServiceId } from "@/config/pricing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () =>
    seo({
      title: "Cleaning Services in DFW | Tranquility Level Cleaning",
      description:
        "Standard, deep, move-in/move-out, and commercial cleaning across Dallas-Fort Worth with approved base pricing, recurring savings, and custom quote options.",
      path: "/services",
    }),
  component: ServicesPage,
});

const serviceIcons = [Home, Sparkles, PackageOpen] as const;

const serviceCopy: Record<ServiceId, { name: { en: string; es: string }; description: { en: string; es: string }; includesEs: string[] }> = {
  standard: {
    name: { en: "Standard Clean", es: "Limpieza estándar" },
    description: {
      en: "Consistent upkeep for a home that already feels cared for. Surfaces, floors, kitchen, and bath are refreshed on a rhythm that suits you.",
      es: "Mantenimiento constante para un hogar que ya recibe cuidado regular. Renovamos superficies, pisos, cocina y baño con la frecuencia que mejor se adapte a ti.",
    },
    includesEs: [
      "Superficies de cocina, exterior de electrodomésticos y fregadero",
      "Lavabo, inodoro, tina o ducha y espejos del baño",
      "Limpieza de polvo en superficies y accesorios alcanzables",
      "Aspirado y trapeado de pisos",
    ],
  },
  deep: {
    name: { en: "Deep Clean", es: "Limpieza profunda" },
    description: {
      en: "A detailed reset for homes that need more attention, including build-up, edges, and the places routine cleaning tends to pass over.",
      es: "Una renovación detallada para hogares que necesitan más atención, incluyendo acumulación, bordes y áreas que una limpieza rutinaria suele pasar por alto.",
    },
    includesEs: [
      "Todo lo incluido en la limpieza estándar, con mayor detalle",
      "Trabajo detallado en bordes, esquinas y molduras alcanzables",
      "Atención a la acumulación en cocina y baño",
      "Limpieza manual detallada de accesorios y superficies alcanzables",
    ],
  },
  move: {
    name: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
    description: {
      en: "An empty-home clean for transitions, whether you are handing keys over or walking into a space that should feel genuinely new.",
      es: "Una limpieza para viviendas vacías o casi vacías durante una mudanza, ya sea que entregues las llaves o llegues a un espacio que debe sentirse verdaderamente renovado.",
    },
    includesEs: [
      "Limpieza detallada de toda la vivienda vacía o casi vacía",
      "Limpieza detallada de cocina y baños",
      "Limpieza de polvo y superficies y accesorios alcanzables",
      "Aspirado y trapeado de pisos",
    ],
  },
};

const addOnEs: Record<string, string> = {
  "extra-bedroom": "Dormitorio adicional",
  "extra-full-bath": "Baño completo adicional",
  "half-bath": "Medio baño",
  "living-room": "Sala adicional",
  "dining-room": "Comedor",
  office: "Oficina",
  "laundry-room": "Lavandería / cuarto de servicio",
  "laundry-wdf": "Lavandería: lavar, secar y doblar",
  "laundry-fold": "Lavandería: solo doblar",
  dishes: "Exceso de platos",
  oven: "Interior del horno",
  fridge: "Interior del refrigerador",
  hood: "Campana y ventilas sobre la estufa",
  cabinets: "Interior de gabinetes",
  "pet-hair": "Aspirado de exceso de pelo de mascotas",
  baseboards: "Zócalos",
  "garage-patio": "Garaje / patio",
  "carpet-spot": "Limpieza puntual de alfombra",
};

const unitEs: Record<string, string> = {
  bedroom: "dormitorio",
  bathroom: "baño",
  "half bath": "medio baño",
  room: "habitación",
  load: "carga",
};

function ServicesPage() {
  const { language, text } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Services", es: "Servicios" })}
        title={text({ en: "Choose the level of care your home needs.", es: "Elige el nivel de cuidado que necesita tu hogar." })}
        intro={text({
          en: "Three residential cleaning types have published starting prices. Commercial work is quoted after consultation. Residential services can be adjusted with approved room charges and add-ons without hiding the pricing foundation.",
          es: "Tres tipos de limpieza residencial tienen precios iniciales publicados. El trabajo comercial se cotiza después de una consulta. Los servicios residenciales pueden ajustarse con cargos aprobados por habitaciones y servicios adicionales sin ocultar la base del precio.",
        })}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link to="/booking">{text({ en: "Request Service", es: "Solicitar servicio" })}</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/quote">{text({ en: "Get a Custom Quote", es: "Solicitar cotización personalizada" })}</Link></Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Residential services", es: "Servicios residenciales" })}
            title={text({ en: "Clear starting points. Flexible scope.", es: "Puntos de partida claros. Alcance flexible." })}
            intro={text({
              en: "Each service starts with the approved base rate for a standard average 1-bedroom, 1-full-bath home and can be adjusted with approved room charges and add-ons.",
              es: "Cada servicio parte de la tarifa base aprobada para una vivienda estándar promedio de 1 dormitorio y 1 baño completo, y puede ajustarse con cargos aprobados por habitaciones y servicios adicionales.",
            })}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = serviceIcons[index] ?? Home;
              const localized = serviceCopy[service.id];
              const included = language === "es" ? localized.includesEs : service.includes.slice(0, 4);
              return (
                <article key={service.id} className="group flex min-h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-moss/45 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-full border border-moss/25 bg-accent/45 text-moss"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="font-display text-3xl text-ink">{money(service.basePrice)}</span>
                  </div>
                  <h2 className="mt-5 text-3xl">{text(localized.name)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text(localized.description)}</p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/80">
                    {included.map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss" aria-hidden="true" />{item}</li>)}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-2">
                    <Button asChild size="sm"><Link to="/booking" search={{ service: service.id }}>{text({ en: "Request service", es: "Solicitar servicio" })}</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to={service.route}>{text({ en: "Service details", es: "Detalles del servicio" })}</Link></Button>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="brand-dark mt-5 grid gap-6 rounded-2xl border border-gold/20 bg-background p-6 shadow-lift md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
            <span className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-moss"><Building2 className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-3xl text-ink">{text({ en: "Commercial / Office Cleaning", es: "Limpieza comercial / de oficinas" })}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {text({
                  en: "Offices, suites, and light commercial spaces vary too much to price like a home. Commercial work always goes through a custom quote or consultation.",
                  es: "Las oficinas, suites y espacios comerciales ligeros varían demasiado para cotizarlos como una vivienda. El trabajo comercial siempre pasa por una cotización personalizada o una consulta.",
                })}
              </p>
            </div>
            <Button asChild><Link to="/commercial-cleaning">{text({ en: "Commercial details", es: "Detalles comerciales" })} <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </article>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Pricing", es: "Precios" })}
            title={text({ en: "Approved base pricing", es: "Precios base aprobados" })}
            intro={text({
              en: "Recurring savings apply only to the service subtotal. Add-ons stay at their listed rate.",
              es: "Los descuentos por servicio recurrente se aplican solo al subtotal del servicio. Los servicios adicionales conservan su precio publicado.",
            })}
          />
          <div className="mt-10"><PricingGrid /></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Add-ons", es: "Servicios adicionales" })}
            title={text({ en: "Customize only what you need", es: "Agrega solo lo que necesitas" })}
            intro={text({
              en: "Add-on pricing varies by cleaning type where noted. Items marked starting at are minimum prices and may be adjusted after review.",
              es: "El precio de los servicios adicionales varía según el tipo de limpieza cuando se indica. Los artículos marcados como precio inicial representan un mínimo y pueden ajustarse después de la revisión.",
            })}
          />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-lift">
            <table className="w-full min-w-[38rem] text-sm">
              <caption className="sr-only">{text({ en: "Add-on pricing by cleaning type", es: "Precios de servicios adicionales por tipo de limpieza" })}</caption>
              <thead className="bg-muted text-left">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">{text({ en: "Add-on", es: "Adicional" })}</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">{text({ en: "Standard", es: "Estándar" })}</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">{text({ en: "Deep", es: "Profunda" })}</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">{text({ en: "Move-In / Out", es: "Entrada / salida" })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {addOns.map((addOn) => (
                  <tr key={addOn.id} className="transition-colors hover:bg-accent/25">
                    <th scope="row" className="px-5 py-4 text-left font-medium text-ink">
                      {language === "es" ? addOnEs[addOn.id] ?? addOn.name : addOn.name}
                      {addOn.startingAt && <span className="ml-2 text-xs font-normal text-muted-foreground">{text({ en: "starting at", es: "desde" })}</span>}
                      {addOn.unit && <span className="ml-2 text-xs font-normal text-muted-foreground">{text({ en: `per ${addOn.unit}`, es: `por ${unitEs[addOn.unit] ?? addOn.unit}` })}</span>}
                    </th>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "standard"))}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "deep"))}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-ink">+{money(addOnPrice(addOn, "move"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {text({
              en: "Base pricing already includes 1 bedroom and 1 full bathroom. Additional rooms are counted from there so nothing is charged twice.",
              es: "El precio base ya incluye 1 dormitorio y 1 baño completo. Las habitaciones adicionales se cuentan a partir de ahí para evitar cargos duplicados.",
            })}
          </p>
        </div>
      </section>

      <CTABand />
    </>
  );
}
