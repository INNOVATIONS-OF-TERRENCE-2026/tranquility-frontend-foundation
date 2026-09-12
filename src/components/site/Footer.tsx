import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { business, cities } from "@/config/business";
import { attribution, businessLeader, technologyLeader } from "@/config/leadership";
import { services, type ServiceId } from "@/config/pricing";
import { Logo } from "./Logo";

const serviceNames: Record<ServiceId, { en: string; es: string }> = {
  standard: { en: "Standard Clean", es: "Limpieza estándar" },
  deep: { en: "Deep Clean", es: "Limpieza profunda" },
  move: { en: "Move-In / Move-Out", es: "Mudanza: entrada / salida" },
};

export function Footer() {
  const { text } = useLanguage();

  return (
    <footer className="brand-dark mt-auto border-t border-gold/20 bg-background text-foreground">
      <div className="container-page py-14 md:py-18">
        <div className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {text({
                en: `Come home to tranquility. Professional cleaning across ${business.serviceAreaLabel} with clear pricing and direct custom-quote options when a home needs more review.`,
                es: "Vuelve a casa con tranquilidad. Limpieza profesional en Dallas-Fort Worth y comunidades cercanas, con precios claros y opciones de cotización personalizada cuando un hogar requiere una evaluación adicional.",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/booking" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/35 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-gold">
              {text({ en: "Request Service", es: "Solicitar servicio" })}
            </Link>
            <Link to="/quote" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/30 px-6 text-sm font-semibold text-gold-soft transition-colors hover:bg-gold/10">
              {text({ en: "Custom Quote", es: "Cotización personalizada" })}
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">{text({ en: "Services", es: "Servicios" })}</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {services.map((service) => (
                <li key={service.id}><Link to={service.route} className="transition-colors hover:text-gold-soft">{text(serviceNames[service.id])}</Link></li>
              ))}
              <li><Link to="/commercial-cleaning" className="transition-colors hover:text-gold-soft">{text({ en: "Commercial / Office", es: "Comercial / oficinas" })}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">{text({ en: "Explore", es: "Explorar" })}</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/service-area" className="transition-colors hover:text-gold-soft">{text({ en: "Service Area", es: "Área de servicio" })}</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-gold-soft">{text({ en: "FAQ", es: "Preguntas frecuentes" })}</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-gold-soft">{text({ en: "About", es: "Nosotros" })}</Link></li>
              <li><Link to="/careers" className="transition-colors hover:text-gold-soft">{text({ en: "Careers", es: "Empleo" })}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">{text({ en: "Contact", es: "Contacto" })}</p>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <a href={business.phoneHref} className="flex items-center gap-2 transition-colors hover:text-gold-soft"><Phone className="size-4 text-moss" aria-hidden="true" />{business.phoneDisplay}</a>
              <a href={business.emailHref} className="block break-all transition-colors hover:text-gold-soft">{business.email}</a>
              <Link to="/contact" className="inline-flex text-gold-soft hover:underline">{text({ en: "General inquiry", es: "Consulta general" })} →</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">{text({ en: "Service area", es: "Área de servicio" })}</p>
            <div className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
              <span>{text({ en: business.serviceAreaLabel, es: "Dallas-Fort Worth y comunidades cercanas" })}</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
              {cities.slice(0, 10).join(" · ")} {text({ en: "and surrounding communities.", es: "y comunidades cercanas." })}
            </p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-border py-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold text-foreground">{text(attribution.ownership)}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
              {businessLeader.name} · {text(businessLeader.role)} · {text(businessLeader.credential)}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-medium text-gold-soft">{text(attribution.engineering)}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
              {technologyLeader.name} · {text(technologyLeader.role)} · {text(technologyLeader.designation)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.legalName}. {text({ en: "All rights reserved.", es: "Todos los derechos reservados." })}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-gold-soft">{text({ en: "Privacy", es: "Privacidad" })}</Link>
            <Link to="/terms" className="hover:text-gold-soft">{text({ en: "Terms", es: "Términos" })}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
