import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/deep-cleaning")({
  head: () =>
    seo({
      title: "Deep Cleaning in Dallas-Fort Worth | Tranquility Level Cleaning",
      description:
        "Detailed deep cleaning across DFW from $215. Focused attention for build-up, edges, trim, and the places routine cleaning passes over.",
      path: "/deep-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="deep"
      eyebrow="Deep cleaning"
      eyebrowEs="Limpieza profunda"
      intro="A thorough reset for homes that need more than routine upkeep. It can also be the right starting point before moving to a recurring schedule."
      introEs="Una renovación completa para hogares que necesitan más que mantenimiento rutinario. También puede ser el punto de partida adecuado antes de pasar a un servicio recurrente."
      bestFor={[
        "First-time cleans before starting recurring service",
        "Homes that have not been professionally cleaned in a while",
        "Seasonal resets and pre-event or post-event cleaning",
      ]}
      bestForEs={[
        "Primera limpieza antes de iniciar un servicio recurrente",
        "Hogares que no han recibido limpieza profesional recientemente",
        "Renovaciones de temporada y limpieza antes o después de un evento",
      ]}
      notes="If the home's condition is significantly heavier than typical, we may recommend a consultation so the estimate reflects the real work involved."
      notesEs="Si la condición del hogar requiere mucho más trabajo de lo habitual, podemos recomendar una consulta para que el estimado refleje el trabajo real necesario."
    />
  ),
});
