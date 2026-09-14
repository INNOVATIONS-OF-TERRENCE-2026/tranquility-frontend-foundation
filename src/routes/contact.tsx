import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, cities } from "@/config/business";
import { seo } from "@/lib/seo";
import { submitContactInquiry } from "@/lib/submissions.functions";

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
  const [serviceType, setServiceType] = useState("standard");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");
  const submitInquiry = useServerFn(submitContactInquiry);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError(
        text({
          en: "Please complete your name, phone, email, and notes.",
          es: "Completa tu nombre, teléfono, correo electrónico y notas.",
        }),
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(
        text({
          en: "Please enter a valid email address.",
          es: "Ingresa un correo electrónico válido.",
        }),
      );
      return;
    }
    if (phone.replace(/\D/g, "").length < 10 || message.trim().length < 10) {
      setError(
        text({
          en: "Enter a valid phone number and at least 10 characters of detail.",
          es: "Ingresa un teléfono válido y al menos 10 caracteres de detalle.",
        }),
      );
      return;
    }
    setStatus("sending");
    try {
      const result = await submitInquiry({
        data: {
          name,
          phone,
          email,
          serviceType: serviceType as
            "standard" | "deep" | "move" | "commercial" | "quote" | "other",
          preferredDate: preferredDate || undefined,
          notes: message,
          language,
          website: "",
        },
      });
      setReference(result.reference);
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError(
        text({
          en: "We could not send your inquiry. Please try again or contact us directly.",
          es: "No pudimos enviar tu consulta. Inténtalo de nuevo o contáctanos directamente.",
        }),
      );
    }
  }

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Contact", es: "Contacto" })}
        title={text({
          en: "A clear next step starts here.",
          es: "Tu siguiente paso comienza aquí.",
        })}
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
              intro={text({
                en: "Choose the option that fits your question.",
                es: "Elige la opción que mejor se adapte a tu consulta.",
              })}
            />
            <div className="mt-8 grid gap-4">
              <a
                href={business.phoneHref}
                className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss"
              >
                <Phone className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">
                  {text({ en: "Call", es: "Llamar" })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{business.phoneDisplay}</p>
              </a>
              <a
                href={business.emailHref}
                className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss"
              >
                <Mail className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">
                  {text({ en: "Email", es: "Correo electrónico" })}
                </p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{business.email}</p>
              </a>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <MapPin className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">
                  {text({ en: "Service area", es: "Área de servicio" })}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {text({
                    en: business.serviceAreaLabel,
                    es: "Dallas-Fort Worth y comunidades cercanas",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg">
                <Link to="/booking">
                  {text({ en: "Request Service", es: "Solicitar servicio" })}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quote">
                  {text({ en: "Get a Custom Quote", es: "Solicitar cotización personalizada" })}
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="max-w-xl">
              <p className="eyebrow">{text({ en: "General inquiry", es: "Consulta general" })}</p>
              <h2 className="mt-3 text-3xl">
                {text({
                  en: "Send an inquiry",
                  es: "Enviar una consulta",
                })}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {text({
                  en: "Share the details Treva needs to review your request. You will receive a reference after it is securely submitted.",
                  es: "Comparte los detalles que Treva necesita para revisar tu solicitud. Recibirás una referencia después de enviarla de forma segura.",
                })}
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">
                    {text({ en: "Full name", es: "Nombre completo" })}
                  </Label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    {text({ en: "Email", es: "Correo electrónico" })}
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">{text({ en: "Phone", es: "Teléfono" })}</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-service">
                    {text({ en: "Service type", es: "Tipo de servicio" })}
                  </Label>
                  <select
                    id="contact-service"
                    value={serviceType}
                    onChange={(event) => setServiceType(event.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="standard">
                      {text({ en: "Standard Clean", es: "Limpieza estándar" })}
                    </option>
                    <option value="deep">
                      {text({ en: "Deep Clean", es: "Limpieza profunda" })}
                    </option>
                    <option value="move">
                      {text({ en: "Move-In / Move-Out", es: "Entrada / salida" })}
                    </option>
                    <option value="commercial">
                      {text({ en: "Commercial", es: "Comercial" })}
                    </option>
                    <option value="quote">
                      {text({ en: "Custom quote", es: "Cotización personalizada" })}
                    </option>
                    <option value="other">{text({ en: "Other", es: "Otro" })}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-date">
                    {text({ en: "Preferred date", es: "Fecha preferida" })}
                  </Label>
                  <Input
                    id="contact-date"
                    type="date"
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">
                  {text({ en: "How can we help?", es: "¿Cómo podemos ayudarte?" })}
                </Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  required
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              {status === "sent" && (
                <p
                  className="rounded-lg bg-accent/40 p-4 text-sm text-accent-foreground"
                  role="status"
                >
                  {text({
                    en: `Your inquiry was received. Reference ${reference}.`,
                    es: `Recibimos tu consulta. Referencia ${reference}.`,
                  })}
                </p>
              )}
              <Button type="submit" size="lg" disabled={status !== "idle"}>
                {status === "sending"
                  ? text({ en: "Sending…", es: "Enviando…" })
                  : text({ en: "Send Inquiry", es: "Enviar consulta" })}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Coverage", es: "Cobertura" })}
            title={text({ en: "Serving Dallas-Fort Worth", es: "Servicio en Dallas-Fort Worth" })}
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {cities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
