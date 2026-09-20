import { createFileRoute } from "@tanstack/react-router";

import { CityPage, type CityGuide } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

const city: CityGuide = {
  slug: "bedford",
  name: "Bedford",
  intro:
    "Just minutes from our home base, Bedford homes get the same careful, checklist-driven cleaning we deliver across the Mid-Cities. Choose a standard upkeep visit, a seasonal deep clean, or a full move-in/move-out service.",
  introEs:
    "A solo minutos de nuestra base, las casas de Bedford reciben la misma limpieza cuidadosa y detallada que ofrecemos en los Mid-Cities. Elige una visita estándar, una limpieza profunda de temporada o un servicio completo de mudanza.",
  neighborhoods: ["Bedford Heights", "Oakridge", "Meadow Park", "Stonegate", "Forest Ridge"],
  nearby: [
    { to: "/house-cleaning-euless", name: "Euless" },
    { to: "/house-cleaning-hurst", name: "Hurst" },
    { to: "/house-cleaning-colleyville", name: "Colleyville" },
    { to: "/house-cleaning-grapevine", name: "Grapevine" },
  ],
};

export const Route = createFileRoute("/house-cleaning-bedford")({
  head: () =>
    seo({
      title: "House Cleaning in Bedford, TX | Tranquility Level Cleaning",
      description:
        "Professional house cleaning in Bedford, Texas. Standard, deep, and move-in/move-out cleaning with written estimates and weekday arrival windows. Book online.",
      path: "/house-cleaning-bedford",
    }),
  component: () => <CityPage city={city} />,
});
