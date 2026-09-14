import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/move-in-move-out-cleaning")({
  head: () =>
    seo({
      title: "Move-In / Move-Out Cleaning in DFW | Tranquility Level Cleaning",
      description:
        "One-time move-in and move-out cleaning across Dallas-Fort Worth starting at $235. A whole-home detail clean for empty spaces in transition.",
      path: "/move-in-move-out-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="move"
      eyebrow="Move-in / move-out"
      eyebrowEs="Mudanza: entrada / salida"
      intro="A one-time detailed clean for homes in transition, whether you are handing over keys or walking into a space that should feel genuinely new on day one."
      introEs="Una limpieza detallada de una sola vez para hogares en transición, ya sea que estés entregando las llaves o entrando a un espacio que debe sentirse verdaderamente renovado desde el primer día."
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
      notes="Move-In / Move-Out Cleaning is offered as a one-time service starting at $235. These cleans work best when the home is empty or nearly empty. Cabinet interiors, appliance interiors, and other detail work can be added in the request flow."
      notesEs="La limpieza de entrada / salida se ofrece como un servicio de una sola vez con precio inicial de $235. Estas limpiezas funcionan mejor cuando la vivienda está vacía o casi vacía. El interior de gabinetes, el interior de electrodomésticos y otros trabajos detallados pueden agregarse a la solicitud."
    />
  ),
});
