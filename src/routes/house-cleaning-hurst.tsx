import { createFileRoute } from "@tanstack/react-router";

import { CityPage } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/house-cleaning-hurst")({
  head: () =>
    seo({
      title: "House Cleaning in Hurst, TX | Tranquility Level Cleaning",
      description:
        "House cleaning for Hurst, Texas homes. Standard, deep, and move-in or move-out service with clear starting prices, weekday arrival windows, and online booking.",
      path: "/house-cleaning-hurst",
    }),
  component: () => (
    <CityPage
      city="Hurst"
      intro={{
        en: "We clean Hurst homes throughout the week, from regular upkeep to full deep cleans before guests arrive. Choose your service and arrival window online and we confirm the details with you.",
        es: "Limpiamos casas en Hurst durante la semana, desde mantenimiento regular hasta limpiezas profundas antes de recibir visitas. Elige tu servicio y horario en línea y confirmamos los detalles contigo.",
      }}
      neighborhoods={[
        "Central Hurst",
        "North Hurst",
        "Hurst Hills",
        "Mayfair",
        "Redbud",
        "Bellaire",
      ]}
      nearby={[
        { label: "House cleaning in Euless", to: "/house-cleaning-euless" },
        { label: "House cleaning in Bedford", to: "/house-cleaning-bedford" },
        { label: "House cleaning in Colleyville", to: "/house-cleaning-colleyville" },
        { label: "House cleaning in Grapevine", to: "/house-cleaning-grapevine" },
      ]}
    />
  ),
});
