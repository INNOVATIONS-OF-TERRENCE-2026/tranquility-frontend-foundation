import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailBody = useMemo(
    () =>
      [
        "General inquiry",
        "",
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim() || "Not provided"}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    [email, message, name, phone],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please complete your name, email, and message.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    window.location.href = mailtoLink(`Website inquiry from ${name.trim()}`, emailBody);
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="A clear next step starts here."
        intro="Reach Tranquility directly, request service, or send a general inquiry. For large, unusual, commercial, or partial-home scope, use the custom quote flow."
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Direct contact"
              title="Talk with Tranquility"
              intro="Choose the option that fits your question."
            />
            <div className="mt-8 grid gap-4">
              <a
                href={business.phoneHref}
                className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss"
              >
                <Phone className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">Call</p>
                <p className="mt-1 text-sm text-muted-foreground">{business.phoneDisplay}</p>
              </a>
              <a
                href={business.emailHref}
                className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-moss"
              >
                <Mail className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">Email</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{business.email}</p>
              </a>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <MapPin className="size-5 text-moss" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">Service area</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {business.serviceAreaLabel}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg">
                <Link to="/booking">Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quote">Get a Custom Quote</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="max-w-xl">
              <p className="eyebrow">General inquiry</p>
              <h2 className="mt-3 text-3xl">Send the details by email</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This frontend does not store your message in a database. Submitting opens your email app with the details filled in for you.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full name</Label>
                  <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">How can we help?</Label>
                <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={7} required />
              </div>
              {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
              <Button type="submit" size="lg">Open Email Draft</Button>
            </form>
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading eyebrow="Coverage" title="Serving Dallas-Fort Worth" />
          <div className="mt-8 flex flex-wrap gap-2">
            {cities.map((city) => (
              <span key={city} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
