import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useMemo, useState } from "react";
import { Car, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

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

const expectations = [
  {
    icon: CheckCircle2,
    title: "Thoughtful work",
    body: "We value detail, consistency, respect for the customer's space, and clear communication.",
  },
  {
    icon: Car,
    title: "Reliable transportation",
    body: "Applicants should be able to travel reliably to customer locations across the service area.",
  },
  {
    icon: Clock3,
    title: "Clear availability",
    body: "Tell us the days and general times you are normally available so scheduling expectations are clear.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy first",
    body: "Do not send Social Security numbers, banking details, identification images, or other sensitive onboarding documents here.",
  },
];

function CareersPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [transportation, setTransportation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [additional, setAdditional] = useState("");
  const [error, setError] = useState("");

  const body = useMemo(
    () =>
      [
        "Tranquility Level Cleaning career interest",
        "",
        `Full name: ${fullName.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim()}`,
        `City: ${city.trim()}`,
        `Reliable transportation: ${transportation || "Not answered"}`,
        "",
        "Cleaning experience:",
        experience.trim(),
        "",
        "General availability:",
        availability.trim(),
        "",
        "Additional information:",
        additional.trim() || "None provided",
      ].join("\n"),
    [additional, availability, city, email, experience, fullName, phone, transportation],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !transportation ||
      !experience.trim() ||
      !availability.trim()
    ) {
      setError("Please complete all required fields before continuing.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    window.location.href = mailtoLink(`Career interest: ${fullName.trim()}`, body);
  }

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Bring care, consistency, and professionalism to the work."
        intro="Tranquility is interested in people who understand that cleaning is personal service. Share the essentials below so the team can learn more about your experience and availability."
      />

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Join the team"
            title="What matters here"
            intro="The first step is simple. We want to understand how you work, where you are located, and whether your availability fits current needs."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {expectations.map(({ icon: Icon, title, body: text }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Icon className="size-5 text-moss" aria-hidden="true" />
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">Career interest form</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Tell us about yourself.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              This frontend does not store applicant information in a database. When you continue, your email app opens with your answers prepared for {business.email}.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-soft">
              <span className="font-semibold text-ink">Privacy note:</span> Do not include a Social Security number, banking information, driver's license image, or other sensitive identity documents.
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="career-name">Full name *</Label>
                <Input id="career-name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career-email">Email *</Label>
                <Input id="career-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career-phone">Phone *</Label>
                <Input id="career-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career-city">City *</Label>
                <Input id="career-city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" required />
              </div>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-ink">Do you have reliable transportation? *</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {["Yes", "No"].map((value) => (
                  <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
                    <input
                      type="radio"
                      name="transportation"
                      value={value}
                      checked={transportation === value}
                      onChange={(e) => setTransportation(e.target.value)}
                      required
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-experience">Cleaning experience *</Label>
              <Textarea
                id="career-experience"
                rows={5}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Tell us about residential, commercial, hospitality, independent, or other relevant cleaning experience."
                required
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-availability">General availability *</Label>
              <Textarea
                id="career-availability"
                rows={4}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Example: weekdays after 8 AM, weekends flexible."
                required
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="career-additional">Anything else we should know?</Label>
              <Textarea id="career-additional" rows={4} value={additional} onChange={(e) => setAdditional(e.target.value)} />
            </div>

            {error && <p className="mt-5 text-sm font-medium text-destructive" role="alert">{error}</p>}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg">Open Application Email</Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your answers are transferred into an email draft. No public applicant database is used in this version.
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
