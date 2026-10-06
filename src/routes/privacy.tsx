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
        en: "Information submitted through the website",
        es: "Información enviada mediante el sitio web",
      }),
      body: text({
        en: "Contact inquiries, career applications, quote requests, booking requests, giveaway entries, and related preferences are securely stored so Tranquility Level Cleaning can review, respond, schedule, and manage customer service. The website does not currently collect payment-card information.",
        es: "Las consultas de contacto, solicitudes de empleo, solicitudes de cotización, solicitudes de servicio, participaciones en sorteos y preferencias relacionadas se almacenan de forma segura para que Tranquility Level Cleaning pueda revisarlas, responder, programar y administrar el servicio al cliente. El sitio no recopila actualmente información de tarjetas de pago.",
      }),
    },
    {
      title: text({
        en: "Information you choose to provide",
        es: "Información que eliges proporcionar",
      }),
      body: text({
        en: "Depending on the form, you may provide your name, email, phone number, service address, city, ZIP code, property details, scheduling preferences, cleaning scope, career information, giveaway nomination details, written descriptions, and other information relevant to your request.",
        es: "Dependiendo del formulario, puedes proporcionar tu nombre, correo electrónico, número de teléfono, dirección del servicio, ciudad, código postal, detalles de la propiedad, preferencias de horario, alcance de limpieza, información laboral, detalles de nominaciones para sorteos, descripciones escritas y otra información pertinente a tu solicitud.",
      }),
    },
    {
      title: text({
        en: "Virtual consultation photos",
        es: "Fotografías para consulta virtual",
      }),
      body: text({
        en: "When you choose to attach photos to a quote request, those images are uploaded only after the quote request is submitted. They are stored in private cloud storage and are available to the authorized owner through time-limited secure links. File type and size limits are enforced.",
        es: "Cuando eliges adjuntar fotografías a una solicitud de cotización, esas imágenes se cargan únicamente después de enviar la solicitud. Se almacenan en un espacio privado en la nube y están disponibles para la propietaria autorizada mediante enlaces seguros de duración limitada. Se aplican límites de tipo y tamaño de archivo.",
      }),
    },
    {
      title: text({
        en: "Monthly giveaway entries",
        es: "Participaciones en el sorteo mensual",
      }),
      body: text({
        en: "Giveaway entries may include the entrant's contact information, whether the entry is for the entrant or another person, general circumstance category, city and ZIP code, and a written explanation. Please do not submit medical records, diagnoses, account information, identification documents, or other highly sensitive records. If another person is nominated, Tranquility may need that person's permission before arranging service at their home.",
        es: "Las participaciones en el sorteo pueden incluir la información de contacto de quien participa, si la participación es para sí mismo o para otra persona, la categoría general de la situación, ciudad y código postal, y una explicación escrita. No envíes expedientes médicos, diagnósticos, información de cuentas, documentos de identificación ni otros registros altamente sensibles. Si se nomina a otra persona, Tranquility puede necesitar su permiso antes de coordinar el servicio en su hogar.",
      }),
    },
    {
      title: text({
        en: "Optional marketing consent",
        es: "Consentimiento opcional de marketing",
      }),
      body: text({
        en: "Email and text-message marketing consent on the giveaway form is optional, separate, and unchecked by default. Choosing not to consent does not affect giveaway eligibility, selection odds, or access to cleaning services. When you opt in, Tranquility records the selected channel, contact information, consent language and version, source, timestamp, and limited technical information needed to document consent. You may unsubscribe from email at any time and may reply STOP to promotional text messages when messaging is activated.",
        es: "El consentimiento para marketing por correo electrónico y mensajes de texto en el formulario del sorteo es opcional, separado y está desmarcado de forma predeterminada. No dar consentimiento no afecta la elegibilidad, las probabilidades de selección ni el acceso a los servicios de limpieza. Cuando aceptas, Tranquility registra el canal seleccionado, la información de contacto, el texto y la versión del consentimiento, la fuente, la fecha y hora, y datos técnicos limitados necesarios para documentar el consentimiento. Puedes cancelar la suscripción por correo electrónico en cualquier momento y responder STOP a los mensajes promocionales cuando la mensajería esté activa.",
      }),
    },
    {
      title: text({ en: "Sensitive information", es: "Información sensible" }),
      body: text({
        en: "Do not submit Social Security numbers, banking information, account credentials, identification documents, medical records, or other highly sensitive personal records through public website forms or photo uploads.",
        es: "No envíes números de Seguro Social, información bancaria, credenciales de cuentas, documentos de identificación, expedientes médicos ni otros registros personales altamente sensibles mediante formularios públicos del sitio o cargas de fotografías.",
      }),
    },
    {
      title: text({ en: "How information is used", es: "Cómo se utiliza la información" }),
      body: text({
        en: "Submitted information is used to respond to requests, evaluate service needs, manage scheduling, review career interest, administer the monthly giveaway, maintain consent records, and send communications that a person has expressly requested or opted into. Customer and applicant records are not intentionally made public.",
        es: "La información enviada se utiliza para responder solicitudes, evaluar necesidades de servicio, administrar horarios, revisar interés laboral, gestionar el sorteo mensual, mantener registros de consentimiento y enviar comunicaciones solicitadas o aceptadas expresamente. Los registros de clientes y solicitantes no se hacen públicos de forma intencional.",
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
          en: "This page explains how the Tranquility website handles information you choose to submit.",
          es: "Esta página explica cómo el sitio de Tranquility maneja la información que eliges enviar.",
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
