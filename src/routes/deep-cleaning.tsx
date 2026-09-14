import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/deep-cleaning")({
  head: () =>
    seo({
      title: "Deep Cleaning in Dallas-Fort Worth | Tranquility Level Cleaning",
      description:
        "Detailed one-time deep cleaning across DFW starting at $215. Focused attention for build-up, edges, trim, and the places routine cleaning passes over.",
      path: "/deep-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="deep"
      eyebrow="Deep cleaning"
      eyebrowEs="Limpieza profunda"
      intro="A thorough one-time reset for homes that need more than routine upkeep. If you want ongoing maintenance afterward, Standard Clean offers recurring options."
      introEs="Una renovación completa de una sola vez para hogares que necesitan más que mantenimiento rutinario. Si después deseas mantenimiento continuo, la limpieza estándar ofrece opciones recurrentes."
      bestFor={[
        "First-time cleans before transitioning to Standard Clean maintenance",
        "Homes that have not been professionally cleaned in a while",
        "Seasonal resets and pre-event or post-event cleaning",
      ]}
      bestForEs={[
        "Primera limpieza antes de pasar al mantenimiento con limpieza estándar",
        "Hogares que no han recibido limpieza profesional recientemente",
        "Renovaciones de temporada y limpieza antes o después de un evento",
      ]}
      notes="Deep Clean is offered as a one-time service starting at $215. If the home's condition is significantly heavier than typical, we may recommend a consultation so the estimate reflects the real work involved."
      notesEs="La limpieza profunda se ofrece como un servicio de una sola vez con precio inicial de $215. Si la condición del hogar requiere mucho más trabajo de lo habitual, podemos recomendar una consulta para que el estimado refleje el trabajo real necesario."
    />
  ),
});
