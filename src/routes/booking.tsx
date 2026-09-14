import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { seo } from "@/lib/seo";

const searchSchema = z.object({
  service: z.enum(["standard", "deep", "move"]).optional(),
});

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Request Cleaning Service | Tranquility Level Cleaning",
      description:
        "Choose a cleaning service, frequency, scope, available date, and arrival window for service across Dallas-Fort Worth.",
      path: "/booking",
    }),
  component: BookingPage,
});

function BookingPage() {
  const search = Route.useSearch();
  const { text } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Request service", es: "Solicitar servicio" })}
        title={text({
          en: "Build a cleaning request that fits your home.",
          es: "Crea una solicitud de limpieza que se adapte a tu hogar.",
        })}
        intro={text({
          en: "Choose the service, frequency, room scope, approved add-ons, and an available date and arrival window. Review your estimate before sending the request. No payment details are collected.",
          es: "Elige el servicio, la frecuencia, el alcance por habitaciones, los servicios adicionales aprobados y una fecha y ventana de llegada disponibles. Revisa tu estimado antes de enviar la solicitud. No se recopilan datos de pago.",
        })}
      />
      <section className="bg-background py-12 md:py-16 lg:py-20">
        <div className="container-page">
          <div className="luxury-panel rounded-3xl p-4 md:p-6 lg:p-8">
            <BookingFlow {...(search.service ? { initialService: search.service } : {})} />
          </div>
        </div>
      </section>
    </>
  );
}
