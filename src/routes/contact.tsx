import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, cities, mailtoLink } from "@/config/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Contact Tranquility Level Cleaning | Dallas-Fort Worth",
      description:
        "Contact Tranquility Level Cleaning for residential cleaning, custom quotes, commercial cleaning, and service questions across Dallas-Fort Worth.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { language, text } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailBody = useMemo(
    () => language === "es"
      ? [
          "Consulta general",
          "",
          `Nombre: ${name.trim()}`,
          `Correo electrónico: ${email.trim()}`,
          `Teléfono: ${phone.trim() || "No proporcionado"}`,
          "",
          "Mensaje:",
          message.trim(),
        ].join("\n")
      : [
          "General inquiry",
          "",
          `Name: ${name.trim()}`,
          `Email: ${email.trim()}`,
          `Phone: ${phone.trim() || "Not provided"}`,
          "",
          "Message:",
          message.trim(),
        ].join("\n"),
    [email, language, message, name, phone],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(text({ en: "Please complete your name, email, and message.", es: "Completa tu nombre, correo electrónico y mensaje." }));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(text({ en: "Please enter a valid email address.", es: "Ingresa un correo electrónico válido." }));
      return;
    }
    window.location.href = mailtoLink(
      language === "es" ? `Consulta del sitio web de ${name.trim()}` : `Website inquiry from ${name.trim()}`,
      emailBody,
    );
  }

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Contact", es: "Contacto" })}
        title={text({ en: "A clear next step starts here.", es: "Tu siguiente paso comienza aquí." })}
        intro={text({
          en: "Reach Tranquility directly, request service, or send a general inquiry. For large, unusual, commercial, or partial-home scope, use the custom quote flow.",
          es: "Comunícate directamente con Tranquility, solicita servicio o envía una consulta general. Para propiedades grandes, trabajos inusuales, espacios comerciales o limpieza parcial del hogar, usa la opción de cotización personalizada.",
        })}
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow={text({ en: "Direct contact", es: "Contacto directo" })}
              title={text({ en: "Talk with Tranquility", es: "Habla con Tranquility" })}
              intro={text({ en: "Choose the option that fits your question.", es: "Elige la opción que mejor se adapte a tu consulta." })}
            />
            <div className="mt-8 grid gap-4">
              <a href={business.phoneHref} className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss">
                <Phone className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">{text({ en: "Call", es: "Llamar" })}</p>
                <p className="mt-1 text-sm text-muted-foreground">{business.phoneDisplay}</p>
              </a>
              <a href={business.emailHref} className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss">
                <Mail className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">{text({ en: "Email", es: "Correo electrónico" })}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{business.email}</p>
              </a>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <MapPin className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">{text({ en: "Service area", es: "Área de servicio" })}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text({ en: business.serviceAreaLabel, es: "Dallas-Fort Worth y comunidades cercanas" })}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg"><Link to="/booking">{text({ en: "Request Service", es: "Solicitar servicio" })}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/quote">{text({ en: "Get a Custom Quote", es: "Solicitar cotización personalizada" })}</Link></Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="max-w-xl">
              <p className="eyebrow">{text({ en: "General inquiry", es: "Consulta general" })}</p>
              <h2 className="mt-3 text-3xl">{text({ en: "Send the details by email", es: "Envía los detalles por correo electrónico" })}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {text({
                  en: "This frontend does not store your message in a database. Submitting opens your email app with the details filled in for you.",
                  es: "Este sitio no guarda tu mensaje en una base de datos. Al enviar, se abre tu aplicación de correo con los detalles ya preparados para que puedas revisarlos.",
                })}
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="contact-name">{text({ en: "Full name", es: "Nombre completo" })}</Label><Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></div>
                <div className="space-y-2"><Label htmlFor="contact-email">{text({ en: "Email", es: "Correo electrónico" })}</Label><Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="contact-phone">{text({ en: "Phone", es: "Teléfono" })}</Label><Input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
              <div className="space-y-2"><Label htmlFor="contact-message">{text({ en: "How can we help?", es: "¿Cómo podemos ayudarte?" })}</Label><Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={7} required /></div>
              {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
              <Button type="submit" size="lg">{text({ en: "Open Email Draft", es: "Abrir borrador de correo" })}</Button>
            </form>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow={text({ en: "Coverage", es: "Cobertura" })} title={text({ en: "Serving Dallas-Fort Worth", es: "Servicio en Dallas-Fort Worth" })} />
          <div className="mt-8 flex flex-wrap gap-2">
            {cities.map((city) => <span key={city} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">{city}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
