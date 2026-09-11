import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";

export function CTABand({
  title,
  intro,
  titleEs,
  introEs,
}: {
  title?: string;
  intro?: string;
  titleEs?: string;
  introEs?: string;
}) {
  const { language, text } = useLanguage();
  const resolvedTitle = language === "es"
    ? titleEs ?? "¿Listo para un hogar más tranquilo?"
    : title ?? "Ready for a calmer home?";
  const resolvedIntro = language === "es"
    ? introEs ?? "Cuéntanos sobre tu espacio y te ayudaremos a elegir el servicio adecuado."
    : intro ?? "Tell us about your space and we will help you choose the right path.";

  return (
    <section className="brand-dark relative overflow-hidden border-y border-gold/20 bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(226,194,122,0.16),transparent_24%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.025)_55%,transparent_100%)]" aria-hidden="true" />
      <div className="container-page relative py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">{text({ en: "Come home to tranquility", es: "Vuelve a casa con tranquilidad" })}</p>
            <h2 className="mt-3 text-4xl text-ink md:text-5xl">{resolvedTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{resolvedIntro}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <Button asChild size="lg">
              <Link to="/booking">{text({ en: "Request Service", es: "Solicitar servicio" })} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold/35 text-foreground hover:bg-gold/10 hover:text-gold-soft">
              <Link to="/quote">{text({ en: "Get a Custom Quote", es: "Solicitar cotización personalizada" })}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-foreground hover:bg-gold/10 hover:text-gold-soft">
              <a href={business.phoneHref}>{text({ en: "Call", es: "Llama al" })} {business.phoneDisplay}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
