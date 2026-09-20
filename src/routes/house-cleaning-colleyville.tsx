import { createFileRoute } from "@tanstack/react-router";

import { CityPage, type CityGuide } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

const city: CityGuide = {
  slug: "colleyville",
  name: "Colleyville",
  intro:
    "Colleyville homes often have larger floor plans and fine finishes, and our checklist reflects that. We tailor each visit room by room, with careful products and a written estimate before any work begins.",
  introEs:
    "Las casas de Colleyville suelen tener planos más amplios y acabados finos, y nuestra lista de limpieza lo refleja. Adaptamos cada visita habitación por habitación, con productos cuidadosos y un estimado por escrito antes de comenzar.",
  neighborhoods: ["Colleyville Downs", "Woodbriar", "Brook Meadows", "Whittier Heights", "Pleasant Glade"],
  nearby: [
    { to: "/house-cleaning-euless", name: "Euless" },
    { to: "/house-cleaning-bedford", name: "Bedford" },
    { to: "/house-cleaning-hurst", name: "Hurst" },
    { to: "/house-cleaning-grapevine", name: "Grapevine" },
  ],
};

export const Route = createFileRoute("/house-cleaning-colleyville")({
  head: () =>
    seo({
      title: "House Cleaning in Colleyville, TX | Tranquility Level Cleaning",
      description:
        "Detailed house cleaning in Colleyville, Texas. Standard, deep, and move-in/move-out cleaning with careful products and weekday arrival windows. Book online.",
      path: "/house-cleaning-colleyville",
    }),
  component: () => <CityPage city={city} />,
});
