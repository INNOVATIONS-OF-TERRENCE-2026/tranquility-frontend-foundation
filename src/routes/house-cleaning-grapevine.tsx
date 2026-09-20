import { createFileRoute } from "@tanstack/react-router";

import { CityPage, type CityGuide } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

const city: CityGuide = {
  slug: "grapevine",
  name: "Grapevine",
  intro:
    "From historic homes near Main Street to newer builds by Grapevine Lake, we help Grapevine households stay guest-ready with detailed standard visits, seasonal deep cleans, and careful move-in/move-out service.",
  introEs:
    "Desde casas históricas cerca de Main Street hasta construcciones nuevas junto al lago Grapevine, ayudamos a los hogares de Grapevine a mantenerse listos con visitas estándar detalladas, limpiezas profundas de temporada y servicio cuidadoso de mudanza.",
  neighborhoods: [
    "Historic Downtown",
    "Silver Lake",
    "Stone Bridge Oaks",
    "Lake Pointe",
    "Heritage Oaks",
  ],
  nearby: [
    { to: "/house-cleaning-euless", name: "Euless" },
    { to: "/house-cleaning-bedford", name: "Bedford" },
    { to: "/house-cleaning-hurst", name: "Hurst" },
    { to: "/house-cleaning-colleyville", name: "Colleyville" },
  ],
};

export const Route = createFileRoute("/house-cleaning-grapevine")({
  head: () =>
    seo({
      title: "House Cleaning in Grapevine, TX | Tranquility Level Cleaning",
      description:
        "House cleaning in Grapevine, Texas. Standard, deep, and move-in/move-out cleaning with clear starting prices and weekday arrival windows. Book your visit online.",
      path: "/house-cleaning-grapevine",
    }),
  component: () => <CityPage city={city} />,
});
