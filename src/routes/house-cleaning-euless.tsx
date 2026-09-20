import { createFileRoute } from "@tanstack/react-router";

import { CityPage, type CityGuide } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

const city: CityGuide = {
  slug: "euless",
  name: "Euless",
  intro:
    "Tranquility Level Cleaning is based in the Mid-Cities, and Euless is our home turf. From apartments near Glade Parks to family homes off Harwood Road, we bring a detailed checklist, careful products, and steady weekday arrival windows to every visit.",
  introEs:
    "Tranquility Level Cleaning tiene su base en los Mid-Cities, y Euless es nuestro hogar. Desde apartamentos cerca de Glade Parks hasta casas familiares junto a Harwood Road, llevamos una lista detallada, productos cuidadosos y horarios de llegada puntuales entre semana a cada visita.",
  neighborhoods: [
    "Glade Parks",
    "Bear Creek",
    "Westdale Hills",
    "Trinity Oaks",
    "Midway Park",
    "Wilkshire",
  ],
  nearby: [
    { to: "/house-cleaning-bedford", name: "Bedford" },
    { to: "/house-cleaning-hurst", name: "Hurst" },
    { to: "/house-cleaning-colleyville", name: "Colleyville" },
    { to: "/house-cleaning-grapevine", name: "Grapevine" },
  ],
};

export const Route = createFileRoute("/house-cleaning-euless")({
  head: () =>
    seo({
      title: "House Cleaning in Euless, TX | Tranquility Level Cleaning",
      description:
        "Local house cleaning in Euless, Texas. Standard, deep, and move-in/move-out cleaning with clear starting prices and weekday arrival windows. Book online today.",
      path: "/house-cleaning-euless",
    }),
  component: () => <CityPage city={city} />,
});
