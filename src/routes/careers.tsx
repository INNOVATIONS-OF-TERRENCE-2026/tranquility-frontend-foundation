import { createFileRoute } from "@tanstack/react-router";
import { Car, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, mailtoLink } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/careers")({
  head: () =>
    seo({
      title: "Careers | Tranquility Level Cleaning",
      description:
        "Share your interest in joining Tranquility Level Cleaning. Submit your contact details, experience, transportation status, and availability by email.",
      path: "/careers",
    }),
  component: CareersPage,
});

function CareersPage() {
  const { language, text } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [transportation, setTransportation] = useState<"yes" | "no" | "">("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [additional, setAdditional] = useState("");
  const [error, setError] = useState("");

  const expectations = [
    {
      icon: CheckCircle2,
      title: text({ en: "Thoughtful work", es: "Trabajo cuidadoso" }),
      body: text({
        en: "We value detail, consistency, respect for the customer's space, and clear communication.",
        es: "Valoramos la atención al detalle, la consistencia, el respeto por el espacio del cliente y una comunicación clara.",
      }),
    },
    {
      icon: Car,
      title: text({ en: "Reliable transportation", es: "Transporte confiable" }),
      body: text({
        en: "Applicants should be able to travel reliably to customer locations across the service area.",
        es: "Las personas solicitantes deben poder trasladarse de forma confiable a las ubicaciones de los clientes dentro del área de servicio.",
      }),
    },
    {
      icon: Clock3,
      title: text({ en: "Clear availability", es: "Disponibilidad clara" }),
      body: text({
        en: "Tell us the days and general times you are normally available so scheduling expectations are clear.",
        es: "Indícanos los días y horarios generales en los que normalmente estás disponible para que las expectativas de horario sean claras.",
      }),
    },
    {
      icon: ShieldCheck,
      title: text({ en: "Privacy first", es: "La privacidad primero" }),
      body: text({
        en: "Do not send Social Security numbers, banking details, identification images, or other sensitive onboarding documents here.",
        es: "No envíes números de Seguro Social, datos bancarios, imágenes de identificación ni otros documentos sensibles de contratación mediante este formulario.",
      }),
    },
  ];

  const body = useMemo(() => {
    if (language === "es") {
      return [
        "Interés de empleo | Tranquility Level Cleaning",
        "",
        `Nombre completo: ${fullName.trim()}`,
        `Correo electrónico: ${email.trim()}`,
        `Teléfono: ${phone.trim()}`,
        `Ciudad: ${city.trim()}`,
        `Transporte confiable: ${transportation === "yes" ? "Sí" : transportation === "no" ? "No" : "Sin respuesta"}`,
        "",
        "Experiencia en limpieza:",
        experience.trim(),
        "",
        "Disponibilidad general:",
        availability.trim(),
        "",
        "Información adicional:",
        additional.trim() || "No se proporcionó información adicional",
      ].join("\n");
    }

    return [
      "Tranquility Level Cleaning career interest",
      "",
      `Full name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
      `Phone: ${phone.trim()}`,
      `City: ${city.trim()}`,
      `Reliable transportation: ${transportation === "yes" ? "Yes" : transportation === "no" ? "No" : "Not answered"}`,
      "",
      "Cleaning experience:",
      experience.trim(),
      "",
      "General availability:",
      availability.trim(),
      "",
      "Additional information:",
      additional.trim() || "None provided",
    ].join("\n");
  }, [additional, availability, city, email, experience, fullName, language, phone, transportation]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !transportation || !experience.trim() || !availability.trim()) {
      setError(text({ en: "Please complete all required fields before continuing.", es: "Completa todos los campos obligatorios antes de continuar." }));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(text({ en: "Please enter a valid email address.", es: "Ingresa un correo electrónico válido." }));
      return;
    }

    window.location.href = mailtoLink(
      language === "es" ? `Interés de empleo: ${fullName.trim()}` : `Career interest: ${fullName.trim()}`,
      body,
    );
  }

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Careers", es: "Empleo" })}
        title={text({
          en: "Bring care, consistency, and professionalism to the work.",
          es: "Aporta cuidado, consistencia y profesionalismo al trabajo.",
        })}
        intro={text({
          en: "Tranquility is interested in people who understand that cleaning is personal service. Share the essentials below so the team can learn more about your experience and availability.",
          es: "Tranquility busca personas que entiendan que la limpieza es un servicio personal. Comparte la información esencial para que el equipo pueda conocer mejor tu experiencia y disponibilidad.",
        })}
      />

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Join the team", es: "Únete al equipo" })}
            title={text({ en: "What matters here", es: "Lo que valoramos" })}
            intro={text({
              en: "The first step is simple. We want to understand how you work, where you are located, and whether your availability fits current needs.",
              es: "El primer paso es sencillo. Queremos conocer cómo trabajas, dónde te encuentras y si tu disponibilidad coincide con las necesidades actuales.",
            })}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {expectations.map(({ icon: Icon, title, body: itemBody }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Icon className="size-5 text-moss" aria-hidden="true" />
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{itemBody}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">{text({ en: "Career interest form", es: "Formulario de interés de empleo" })}</p>
            <h2 className="mt-3 text-3xl md:text-4xl">{text({ en: "Tell us about yourself.", es: "Cuéntanos sobre ti." })}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {text({
                en: `This frontend does not store applicant information in a database. When you continue, your email app opens with your answers prepared for ${business.email}.`,
                es: `Este sitio no guarda la información de solicitantes en una base de datos. Al continuar, se abrirá tu aplicación de correo con tus respuestas preparadas para ${business.email}.`,
              })}
            </p>
            <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-soft">
              <span className="font-semibold text-ink">{text({ en: "Privacy note:", es: "Nota de privacidad:" })}</span>{" "}
              {text({
                en: "Do not include a Social Security number, banking information, driver's license image, or other sensitive identity documents.",
                es: "No incluyas tu número de Seguro Social, información bancaria, imagen de licencia de conducir ni otros documentos sensibles de identidad.",
              })}
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="career-name">{text({ en: "Full name *", es: "Nombre completo *" })}</Label><Input id="career-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></div>
              <div className="space-y-2"><Label htmlFor="career-email">{text({ en: "Email *", es: "Correo electrónico *" })}</Label><Input id="career-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
              <div className="space-y-2"><Label htmlFor="career-phone">{text({ en: "Phone *", es: "Teléfono *" })}</Label><Input id="career-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" required /></div>
              <div className="space-y-2"><Label htmlFor="career-city">{text({ en: "City *", es: "Ciudad *" })}</Label><Input id="career-city" value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" required /></div>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-ink">{text({ en: "Do you have reliable transportation? *", es: "¿Tienes transporte confiable? *" })}</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {(["yes", "no"] as const).map((value) => (
                  <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
                    <input type="radio" name="transportation" value={value} checked={transportation === value} onChange={(event) => setTransportation(event.target.value as "yes" | "no")} required />
                    {value === "yes" ? text({ en: "Yes", es: "Sí" }) : text({ en: "No", es: "No" })}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-experience">{text({ en: "Cleaning experience *", es: "Experiencia en limpieza *" })}</Label>
              <Textarea id="career-experience" rows={5} value={experience} onChange={(event) => setExperience(event.target.value)} placeholder={text({ en: "Tell us about residential, commercial, hospitality, independent, or other relevant cleaning experience.", es: "Cuéntanos sobre tu experiencia en limpieza residencial, comercial, hotelería, trabajo independiente u otra experiencia relevante." })} required />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-availability">{text({ en: "General availability *", es: "Disponibilidad general *" })}</Label>
              <Textarea id="career-availability" rows={4} value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder={text({ en: "Example: weekdays after 8 AM, weekends flexible.", es: "Ejemplo: entre semana después de las 8 AM, fines de semana flexible." })} required />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-additional">{text({ en: "Anything else we should know?", es: "¿Hay algo más que debamos saber?" })}</Label>
              <Textarea id="career-additional" rows={4} value={additional} onChange={(event) => setAdditional(event.target.value)} />
            </div>

            {error && <p className="mt-5 text-sm font-medium text-destructive" role="alert">{error}</p>}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg">{text({ en: "Open Application Email", es: "Abrir correo de solicitud" })}</Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {text({
                  en: "Your answers are transferred into an email draft. No public applicant database is used in this version.",
                  es: "Tus respuestas se transfieren a un borrador de correo electrónico. Esta versión no utiliza una base de datos pública de solicitantes.",
                })}
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
