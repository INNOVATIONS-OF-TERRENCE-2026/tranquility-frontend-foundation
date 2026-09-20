import { createFileRoute } from "@tanstack/react-router";

import { CityPage } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/house-cleaning-bedford")({
  head: () =>
    seo({
      title: "House Cleaning in Bedford, TX | Tranquility Level Cleaning",
      description:
        "House cleaning for Bedford, Texas homes. Standard, deep, and move-in or move-out service with clear starting prices, weekday arrival windows, and online booking.",
      path: "/house-cleaning-bedford",
    }),
  component: () => (
    <CityPage
      city="Bedford"
      intro={{
        en: "Bedford sits minutes from our Euless base, so scheduling is simple. Choose the service that fits your home, pick a weekday arrival window, and we confirm the details with you before the visit.",
        es: "Bedford está a minutos de nuestra base en Euless, así que agendar es sencillo. Elige el servicio que necesita tu casa, selecciona un horario entre semana y confirmamos los detalles antes de la visita.",
      }}
      neighborhoods={[
        "Central Bedford",
        "Old Bedford",
        "Shady Oaks",
        "Bedford Heights",
        "Stonegate",
        "Forest Ridge",
      ]}
      nearby={[
        { label: "House cleaning in Euless", to: "/house-cleaning-euless" },
        { label: "House cleaning in Hurst", to: "/house-cleaning-hurst" },
        { label: "House cleaning in Colleyville", to: "/house-cleaning-colleyville" },
        { label: "House cleaning in Grapevine", to: "/house-cleaning-grapevine" },
      ]}
    />
  ),
});
