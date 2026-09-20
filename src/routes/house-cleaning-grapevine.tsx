import { createFileRoute } from "@tanstack/react-router";

import { CityPage } from "@/components/site/CityPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/house-cleaning-grapevine")({
  head: () =>
    seo({
      title: "House Cleaning in Grapevine, TX | Tranquility Level Cleaning",
      description:
        "House cleaning for Grapevine, Texas homes. Standard, deep, and move-in or move-out service with clear starting prices, weekday arrival windows, and online booking.",
      path: "/house-cleaning-grapevine",
    }),
  component: () => (
    <CityPage
      city="Grapevine"
      intro={{
        en: "From lake-side homes to downtown Grapevine, we keep the same checklist on every visit. Choose your service, pick a weekday arrival window, and we confirm the details with you.",
        es: "Desde las casas cerca del lago hasta el centro de Grapevine, usamos la misma lista de verificación en cada visita. Elige tu servicio, selecciona un horario entre semana y confirmamos los detalles contigo.",
      }}
      neighborhoods={[
        "Historic Downtown",
        "Silver Lake",
        "Dove Estates",
        "Timberline",
        "Western Oaks",
        "Lakeview",
      ]}
      nearby={[
        { label: "House cleaning in Euless", to: "/house-cleaning-euless" },
        { label: "House cleaning in Bedford", to: "/house-cleaning-bedford" },
        { label: "House cleaning in Hurst", to: "/house-cleaning-hurst" },
        { label: "House cleaning in Colleyville", to: "/house-cleaning-colleyville" },
      ]}
    />
  ),
});
