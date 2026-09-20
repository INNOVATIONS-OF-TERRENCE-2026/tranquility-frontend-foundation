import { createFileRoute } from "@tanstack/react-router";

import { CityPage, type CityGuide } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

const city: CityGuide = {
  slug: "hurst",
  name: "Hurst",
  intro:
    "From townhomes near North East Mall to quiet streets off Pipeline Road, Hurst households count on Tranquility Level Cleaning for steady, detailed work and clear written estimates before we begin.",
  introEs:
    "Desde casas cerca de North East Mall hasta calles tranquilas junto a Pipeline Road, los hogares de Hurst confían en Tranquility Level Cleaning por un trabajo detallado y constante, con estimados claros por escrito antes de comenzar.",
  neighborhoods: ["Hurst Hills", "Shady Oaks", "Mayfair", "Redbud", "Wintergreen North"],
  nearby: [
    { to: "/house-cleaning-euless", name: "Euless" },
    { to: "/house-cleaning-bedford", name: "Bedford" },
    { to: "/house-cleaning-colleyville", name: "Colleyville" },
    { to: "/house-cleaning-grapevine", name: "Grapevine" },
  ],
};

export const Route = createFileRoute("/house-cleaning-hurst")({
  head: () =>
    seo({
      title: "House Cleaning in Hurst, TX | Tranquility Level Cleaning",
      description:
        "Reliable house cleaning in Hurst, Texas. Standard, deep, and move-in/move-out services with clear prices and weekday arrival windows. Request your booking online.",
      path: "/house-cleaning-hurst",
    }),
  component: () => <CityPage city={city} />,
});
