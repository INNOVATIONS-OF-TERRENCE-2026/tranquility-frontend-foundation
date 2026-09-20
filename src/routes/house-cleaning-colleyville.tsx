import { createFileRoute } from "@tanstack/react-router";

import { CityPage } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/house-cleaning-colleyville")({
  head: () =>
    seo({
      title: "House Cleaning in Colleyville, TX | Tranquility Level Cleaning",
      description:
        "House cleaning for Colleyville, Texas homes. Standard, deep, and move-in or move-out service with clear starting prices, weekday arrival windows, and online booking.",
      path: "/house-cleaning-colleyville",
    }),
  component: () => (
    <CityPage
      city="Colleyville"
      intro={{
        en: "Colleyville homes are often larger, so your estimate is built from the exact rooms and add-ons you select. Book a weekday arrival window online and we confirm the scope with you.",
        es: "Las casas en Colleyville suelen ser más grandes, por eso tu estimado se calcula según las habitaciones y extras que selecciones. Reserva un horario entre semana y confirmamos el alcance contigo.",
      }}
      neighborhoods={[
        "Central Colleyville",
        "Whittier Heights",
        "Montclair",
        "Creekside",
        "Bransford",
        "Pleasant Run",
      ]}
      nearby={[
        { label: "House cleaning in Euless", to: "/house-cleaning-euless" },
        { label: "House cleaning in Bedford", to: "/house-cleaning-bedford" },
        { label: "House cleaning in Hurst", to: "/house-cleaning-hurst" },
        { label: "House cleaning in Grapevine", to: "/house-cleaning-grapevine" },
      ]}
    />
  ),
});
