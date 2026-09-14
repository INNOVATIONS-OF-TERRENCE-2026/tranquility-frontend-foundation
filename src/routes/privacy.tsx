import { createFileRoute } from "@tanstack/react-router";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { business } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy | Tranquility Level Cleaning",
      description: "Privacy information for the Tranquility Level Cleaning website.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { text } = useLanguage();
  const sections = [
    {
      title: text({
        en: "Current website form behavior",
        es: "Funcionamiento actual de los formularios",
      }),
      body: text({
        en: "Contact, career, and quote forms securely store the information you submit so Tranquility Level Cleaning can review and respond. The website does not currently provide customer accounts or collect payment-card information.",
        es: "Los formularios de contacto, empleo y cotización guardan de forma segura la información que envías para que Tranquility Level Cleaning pueda revisarla y responder. El sitio no ofrece actualmente cuentas de clientes ni recopila información de tarjetas de pago.",
      }),
    },
    {
      title: text({
        en: "Information you choose to provide",
        es: "Información que eliges proporcionar",
      }),
      body: text({
        en: "Depending on the form, you may choose to provide your name, email, phone number, service address, property details, scheduling preferences, cleaning scope, career information, and written notes. Only provide information that is relevant to your request.",
        es: "Dependiendo del formulario, puedes proporcionar tu nombre, correo electrónico, número de teléfono, dirección del servicio, detalles de la propiedad, preferencias de horario, alcance de limpieza, información laboral y notas escritas. Proporciona únicamente la información pertinente a tu solicitud.",
      }),
    },
    {
      title: text({ en: "Sensitive information", es: "Información sensible" }),
      body: text({
        en: "Do not submit Social Security numbers, banking information, account credentials, identification documents, medical information, or other sensitive personal records through public website forms or photo-selection areas.",
        es: "No envíes números de Seguro Social, información bancaria, credenciales de cuentas, documentos de identificación, información médica ni otros registros personales sensibles mediante formularios públicos del sitio o áreas de selección de fotografías.",
      }),
    },
    {
      title: text({
        en: "Photos selected for virtual consultation",
        es: "Fotografías seleccionadas para una consulta virtual",
      }),
      body: text({
        en: "In the current frontend version, selecting property photos does not upload them to a server. Browser previews remain local to your device unless you separately choose to send files using a communication method provided by Tranquility.",
        es: "En la versión actual del sitio, seleccionar fotografías de la propiedad no las carga a un servidor. Las vistas previas permanecen localmente en tu dispositivo a menos que decidas enviar los archivos por separado mediante un método de comunicación proporcionado por Tranquility.",
      }),
    },
    {
      title: text({ en: "Future service changes", es: "Cambios futuros del servicio" }),
      body: text({
        en: "Submitted information is used to respond to requests, evaluate service needs, and review career interest. It is not made publicly available. This notice will be updated before online payments, customer accounts, or other materially different uses are introduced.",
        es: "La información enviada se utiliza para responder solicitudes, evaluar necesidades de servicio y revisar interés laboral. No se publica. Este aviso se actualizará antes de incorporar pagos en línea, cuentas de clientes u otros usos sustancialmente diferentes.",
      }),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Privacy", es: "Privacidad" })}
        title={text({
          en: "Your information should be handled with care.",
          es: "Tu información debe tratarse con cuidado.",
        })}
        intro={text({
          en: "This page explains how the current Tranquility website handles information entered into its frontend forms.",
          es: "Esta página explica cómo el sitio actual de Tranquility maneja la información ingresada en sus formularios.",
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
            <h2 className="text-2xl">{text({ en: "Contact", es: "Contacto" })}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {text({
                en: "Questions about website privacy can be directed to",
                es: "Las preguntas sobre la privacidad del sitio pueden dirigirse a",
              })}{" "}
              <a className="font-semibold text-moss hover:underline" href={business.emailHref}>
                {business.email}
              </a>{" "}
              {text({ en: "or", es: "o al" })}{" "}
              <a className="font-semibold text-moss hover:underline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
