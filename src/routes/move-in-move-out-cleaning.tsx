import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/move-in-move-out-cleaning")({
  head: () =>
    seo({
      title: "Move-In / Move-Out Cleaning in DFW | Tranquility Level Cleaning",
      description:
        "Move-in and move-out cleaning across Dallas-Fort Worth from $235. A whole-home detail clean for empty spaces in transition.",
      path: "/move-in-move-out-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="move"
      eyebrow="Move-in / move-out"
      eyebrowEs="Mudanza: entrada / salida"
      intro="For homes in transition, whether you are handing over keys or walking into a space that should feel genuinely new on day one."
      introEs="Para hogares en transición, ya sea que estés entregando las llaves o entrando a un espacio que debe sentirse verdaderamente renovado desde el primer día."
      bestFor={[
        "Renters and owners preparing to hand over a property",
        "New homeowners who want a clean slate before unpacking",
        "Property managers turning over a unit between residents",
      ]}
      bestForEs={[
        "Inquilinos y propietarios que se preparan para entregar una propiedad",
        "Nuevos propietarios que desean un espacio limpio antes de desempacar",
        "Administradores de propiedades que preparan una unidad entre residentes",
      ]}
      notes="These cleans work best when the home is empty or nearly empty. Cabinet interiors, appliance interiors, and other detail work can be added in the request flow."
      notesEs="Estas limpiezas funcionan mejor cuando la vivienda está vacía o casi vacía. El interior de gabinetes, el interior de electrodomésticos y otros trabajos detallados pueden agregarse a la solicitud."
    />
  ),
});
