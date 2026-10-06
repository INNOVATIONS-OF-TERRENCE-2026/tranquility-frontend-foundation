import { createFileRoute, Link } from "@tanstack/react-router";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "Website Terms | Tranquility Level Cleaning",
      description: "Website terms and service-request information for Tranquility Level Cleaning.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  const { text } = useLanguage();
  const sections = [
    {
      title: text({
        en: "Service requests and quotes",
        es: "Solicitudes de servicio y cotizaciones",
      }),
      body: text({
        en: "Information submitted through the website is a request for review. Service scope, timing, availability, and final pricing may require confirmation before an appointment is accepted.",
        es: "La información enviada mediante el sitio web constituye una solicitud para revisión. El alcance del servicio, el horario, la disponibilidad y el precio final pueden requerir confirmación antes de que se acepte una cita.",
      }),
    },
    {
      title: text({ en: "Pricing shown online", es: "Precios mostrados en línea" }),
      body: text({
        en: "Residential base pricing is based on a standard average 1-bedroom, 1-full-bath home. Square footage, layout, condition, customizations, additional rooms, unusual scope, specialty work, and selected add-ons may affect the final amount. Starting-at items may require review before a final price is confirmed.",
        es: "El precio residencial base se calcula a partir de una vivienda estándar promedio de 1 dormitorio y 1 baño completo. Los pies cuadrados, la distribución, el estado de la vivienda, las personalizaciones, habitaciones adicionales, alcances inusuales, trabajos especializados y extras seleccionados pueden afectar el importe final. Los elementos con precio inicial pueden requerir revisión antes de confirmar un precio final.",
      }),
    },
    {
      title: text({
        en: "Custom and commercial work",
        es: "Trabajos personalizados y comerciales",
      }),
      body: text({
        en: "Large properties, partial-home requests, unusual layouts, specialty cleaning, and commercial or office work are handled through a custom quote or consultation rather than residential instant pricing.",
        es: "Las propiedades grandes, solicitudes para limpiar solo una parte del hogar, distribuciones inusuales, limpieza especializada y trabajos comerciales o de oficina se gestionan mediante una cotización personalizada o consulta, en lugar de utilizar precios residenciales automáticos.",
      }),
    },
    {
      title: text({ en: "Scheduling", es: "Programación" }),
      body: text({
        en: "A preferred date or arrival window is a request, not a guarantee of availability. Tranquility will confirm service timing with you before the visit is treated as scheduled.",
        es: "Una fecha o franja de llegada preferida es una solicitud y no garantiza disponibilidad. Tranquility confirmará contigo el horario del servicio antes de considerar la visita como programada.",
      }),
    },
    {
      title: text({ en: "Monthly giveaway", es: "Sorteo mensual" }),
      body: text({
        en: "The monthly complimentary cleaning giveaway requires no purchase. Entries are limited to one per email address or phone number per monthly drawing. Entries received by the 3rd are associated with that month's drawing; entries received after that deadline are associated with the next monthly drawing. Eligible entries are selected at random. A written description is collected to understand the circumstance but is not used to increase selection odds. Service area, safety, property condition, access, scope, and scheduling restrictions apply. Heavily cluttered spaces may be limited to one room or defined area rather than the entire home. Selection does not create a guaranteed right to service until eligibility, scope, permission, and scheduling are confirmed. Void where prohibited.",
        es: "El sorteo mensual de limpieza de cortesía no requiere compra. Se permite una participación por correo electrónico o número de teléfono en cada sorteo mensual. Las participaciones recibidas a más tardar el día 3 se asocian con el sorteo de ese mes; las recibidas después de esa fecha se asocian con el siguiente sorteo mensual. Las participaciones elegibles se seleccionan al azar. Se solicita una descripción escrita para comprender la situación, pero no se utiliza para aumentar las probabilidades de selección. Se aplican restricciones de área de servicio, seguridad, condición de la propiedad, acceso, alcance y programación. Los espacios con mucho desorden pueden limitarse a una habitación o área definida en lugar de toda la vivienda. La selección no crea un derecho garantizado al servicio hasta que se confirmen la elegibilidad, el alcance, los permisos y la programación. Nulo donde esté prohibido.",
      }),
    },
    {
      title: text({ en: "Marketing consent", es: "Consentimiento de marketing" }),
      body: text({
        en: "Marketing email and text-message consent is optional and is not a condition of entering the giveaway or purchasing services. Promotional text-message frequency may vary and message or data rates may apply. A person may opt out of promotional text messages by replying STOP once messaging is active, and may unsubscribe from promotional email using the unsubscribe method provided with those messages.",
        es: "El consentimiento para marketing por correo electrónico y mensajes de texto es opcional y no es condición para participar en el sorteo ni para comprar servicios. La frecuencia de mensajes de texto promocionales puede variar y pueden aplicarse tarifas de mensajes o datos. Una persona puede cancelar los mensajes promocionales respondiendo STOP cuando la mensajería esté activa y puede cancelar la suscripción de correos promocionales mediante el método incluido en esos mensajes.",
      }),
    },
    {
      title: text({ en: "Payments", es: "Pagos" }),
      body: text({
        en: "The current website does not collect payment-card information. Any future payment process must be separately presented and authorized before it is used.",
        es: "El sitio web actual no recopila información de tarjetas de pago. Cualquier proceso de pago futuro deberá presentarse y autorizarse por separado antes de utilizarse.",
      }),
    },
    {
      title: text({ en: "Website content", es: "Contenido del sitio web" }),
      body: text({
        en: "The website is intended to provide accurate service information, but a specific cleaning request may require details that cannot be fully evaluated online. When a property or requested scope falls outside the standard assumptions shown on the site, Tranquility may recommend a custom quote.",
        es: "El sitio web busca proporcionar información precisa sobre los servicios, pero una solicitud específica de limpieza puede requerir detalles que no pueden evaluarse completamente en línea. Cuando una propiedad o el alcance solicitado se encuentre fuera de los supuestos estándar mostrados en el sitio, Tranquility puede recomendar una cotización personalizada.",
      }),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Website terms", es: "Términos del sitio" })}
        title={text({
          en: "Clear expectations before service is confirmed.",
          es: "Expectativas claras antes de confirmar el servicio.",
        })}
        intro={text({
          en: "The website helps you understand services, review pricing, and share your cleaning needs. A website request is not a guaranteed appointment.",
          es: "El sitio web te ayuda a conocer los servicios, revisar precios y compartir tus necesidades de limpieza. Una solicitud enviada por el sitio no constituye una cita garantizada.",
        })}
      />

      <section className="section">
        <div className="container-page max-w-3xl space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl">{section.title}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-2xl">{text({ en: "Questions", es: "Preguntas" })}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {text({
                en: "For questions about service expectations, call",
                es: "Si tienes preguntas sobre las condiciones del servicio, llama al",
              })}{" "}
              <a className="font-semibold text-moss hover:underline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>{" "}
              {text({ en: "or email", es: "o escribe a" })}{" "}
              <a className="font-semibold text-moss hover:underline" href={business.emailHref}>
                {business.email}
              </a>
              . {text({ en: "You can also use the", es: "También puedes usar la" })}{" "}
              <Link className="font-semibold text-moss hover:underline" to="/contact">
                {text({ en: "contact page", es: "página de contacto" })}
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
