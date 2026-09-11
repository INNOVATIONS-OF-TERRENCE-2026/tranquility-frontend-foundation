import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/site/ServiceDetail";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/residential-cleaning")({
  head: () =>
    seo({
      title: "Residential Standard Cleaning in DFW | Tranquility Level Cleaning",
      description:
        "Recurring residential house cleaning across Dallas-Fort Worth from $145. Weekly, bi-weekly, and monthly service with savings up to 20%.",
      path: "/residential-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="standard"
      eyebrow="Residential cleaning"
      eyebrowEs="Limpieza residencial"
      intro="Regular upkeep that keeps your home feeling settled. This is the service most households choose on a weekly, bi-weekly, or monthly rhythm."
      introEs="Mantenimiento regular que ayuda a que tu hogar se sienta cuidado y en orden. Es el servicio que muchas familias eligen semanalmente, cada dos semanas o mensualmente."
      bestFor={[
        "Homes that are already maintained and need consistent upkeep",
        "Busy households wanting a dependable rhythm",
        "Anyone who wants the home to feel reset without a full overhaul",
      ]}
      bestForEs={[
        "Hogares que ya se mantienen y necesitan cuidado constante",
        "Familias ocupadas que desean una rutina confiable",
        "Quienes desean renovar la sensación del hogar sin una limpieza profunda completa",
      ]}
      notes="Base pricing covers a standard average 1-bedroom, 1-full-bath home. Additional bedrooms, bathrooms, living spaces, and extras are added individually so you only pay for the rooms you want serviced."
      notesEs="El precio base cubre una vivienda estándar promedio de 1 dormitorio y 1 baño completo. Los dormitorios, baños, salas y servicios adicionales se agregan individualmente para que pagues por el alcance que solicitas."
    />
  ),
});
