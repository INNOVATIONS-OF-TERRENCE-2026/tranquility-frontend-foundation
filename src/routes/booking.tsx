import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
  BookingFlow,
  type BookingPrefill,
} from "@/components/booking/BookingFlow";
import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { selectableAddOns } from "@/config/pricing";
import { seo } from "@/lib/seo";

const frequencySchema = z.enum(["onetime", "weekly", "biweekly", "monthly"]);
const safeCount = z.coerce.number().int().min(0).max(20).optional();
const safePositiveCount = z.coerce.number().int().min(1).max(20).optional();

const searchSchema = z.object({
  service: z.enum(["standard", "deep", "move"]).optional(),
  frequency: frequencySchema.optional(),
  bedrooms: safePositiveCount,
  fullBaths: safePositiveCount,
  halfBaths: safeCount,
  sqft: z.coerce.number().int().min(100).max(25000).optional(),
  extras: z.string().trim().max(300).optional(),
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

  const approvedExtraIds = new Set(selectableAddOns.map((item) => item.id));
  const extras = (search.extras ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && approvedExtraIds.has(item))
    .slice(0, 12);

  const prefill: BookingPrefill = {
    ...(search.service ? { service: search.service } : {}),
    ...(search.frequency ? { frequency: search.frequency } : {}),
    ...(search.bedrooms ? { bedrooms: search.bedrooms } : {}),
    ...(search.fullBaths ? { fullBaths: search.fullBaths } : {}),
    ...(search.halfBaths !== undefined ? { halfBaths: search.halfBaths } : {}),
    ...(search.sqft ? { sqft: search.sqft } : {}),
    ...(extras.length ? { extras } : {}),
  };

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
            <BookingFlow prefill={prefill} />
          </div>
        </div>
      </section>
    </>
  );
}
