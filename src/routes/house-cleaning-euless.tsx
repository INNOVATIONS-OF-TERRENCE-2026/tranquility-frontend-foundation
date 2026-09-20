import { createFileRoute } from "@tanstack/react-router";

import { CityPage } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/house-cleaning-euless")({
  head: () =>
    seo({
      title: "House Cleaning in Euless, TX | Tranquility Level Cleaning",
      description:
        "Local house cleaning in Euless, Texas. Standard, deep, and move-in or move-out cleaning with clear starting prices, weekday arrival windows, and online booking.",
      path: "/house-cleaning-euless",
    }),
  component: () => (
    <CityPage
      city="Euless"
      intro={{
        en: "Tranquility Level Cleaning is based in the Euless area and cleans homes across the city every weekday. Pick your service, choose an arrival window on the booking calendar, and we confirm the details with you.",
        es: "Tranquility Level Cleaning atiende el área de Euless y limpia casas en toda la ciudad entre semana. Elige tu servicio, selecciona un horario en el calendario y confirmamos los detalles contigo.",
      }}
      neighborhoods={[
        "Central Euless",
        "North Euless",
        "South Euless",
        "Midway Park",
        "Bear Creek",
        "Glade Parks",
      ]}
      nearby={[
        { label: "House cleaning in Bedford", to: "/house-cleaning-bedford" },
        { label: "House cleaning in Hurst", to: "/house-cleaning-hurst" },
        { label: "House cleaning in Colleyville", to: "/house-cleaning-colleyville" },
        { label: "House cleaning in Grapevine", to: "/house-cleaning-grapevine" },
      ]}
    />
  ),
});
