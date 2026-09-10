import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { z } from "zod";

import { seo } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, mailtoLink } from "@/config/business";

export const Route = createFileRoute("/quote")({
  head: () =>
    seo({
      title: "Custom Quote & Virtual Consultation | Tranquility Level Cleaning",
      description:
        "Request a custom cleaning quote or virtual consultation for large homes, partial-home scope, specialty work, or commercial spaces in Dallas-Fort Worth.",
      path: "/quote",
    }),
  component: QuotePage,
});

const schema = z.object({
  propertyType: z.enum(["residential", "commercial", "specialty"]),
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(25),
  city: z.string().trim().min(2, "Enter your city").max(80),
  size: z.string().trim().max(60).optional().or(z.literal("")),
  scope: z.string().trim().min(10, "Tell us a little about the scope").max(1200),
  timing: z.string().trim().max(160).optional().or(z.literal("")),
  contactPreference: z.enum(["phone", "email", "text", "video"]),
  notes: z.string().trim().max(1200).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;
type LocalPhoto = { name: string; url: string };

const propertyTypes = [
  { id: "residential", label: "Residential", note: "Large, unusual, or partial-home scope" },
  { id: "commercial", label: "Commercial / Office", note: "Suites, offices, light commercial" },
  { id: "specialty", label: "Specialty", note: "Post-renovation, unique surfaces, or other needs" },
] as const;

const contactPrefs = [
  { id: "phone", label: "Phone call" },
  { id: "email", label: "Email" },
  { id: "text", label: "Text message" },
  { id: "video", label: "Video consultation" },
] as const;

function QuotePage() {
  const [values, setValues] = useState<Values>({
    propertyType: "residential",
    name: "",
    email: "",
    phone: "",
    city: "",
    size: "",
    scope: "",
    timing: "",
    contactPreference: "phone",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [ready, setReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<LocalPhoto[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    },
    [],
  );

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setReady(false);
  };

  function addPhotos(files: FileList | null) {
    if (!files) return;

    const availableSlots = Math.max(0, 6 - photos.length);
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots)
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));

    setPhotos((previous) => [...previous, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((previous) => {
      const target = previous[index];
      if (target) URL.revokeObjectURL(target.url);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function validate() {
    const result = schema.safeParse(values);
    const next: Partial<Record<keyof Values, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof Values] = issue.message;
      }
    }
    setErrors(next);
    const valid = Object.keys(next).length === 0;
    setReady(valid);
    return valid;
  }

  const body = [
    "CUSTOM QUOTE / CONSULTATION REQUEST",
    "",
    `Property type: ${values.propertyType}`,
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone}`,
    `City: ${values.city}`,
    `Approximate size: ${values.size || "not provided"}`,
    `Preferred contact: ${values.contactPreference}`,
    `Desired timing: ${values.timing || "flexible"}`,
    "",
    "SCOPE & CONDITION",
    values.scope,
    "",
    "ADDITIONAL NOTES",
    values.notes || "none",
    photos.length ? `\nCustomer selected ${photos.length} photo(s) locally to share on request.` : "",
  ].join("\n");

  return (
    <>
      <PageHero
        eyebrow="Custom quote"
        title="Get a custom quote or virtual consultation"
        intro="For larger homes, partial-home scope, specialty work, and commercial spaces. These are situations a standard estimate should not decide on its own."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              validate();
            }}
            className="space-y-8"
          >
            <fieldset>
              <legend className="text-lg">What kind of property?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {propertyTypes.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => set("propertyType", property.id)}
                    aria-pressed={values.propertyType === property.id}
                    className={`min-h-24 rounded-lg border p-4 text-left transition-colors ${
                      values.propertyType === property.id
                        ? "border-moss bg-accent/40"
                        : "border-border bg-card hover:border-moss/50"
                    }`}
                  >
                    <span className="block text-sm font-medium text-ink">{property.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{property.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="q-name" label="Full name" value={values.name} error={errors.name} onChange={(value) => set("name", value)} autoComplete="name" />
              <TextField id="q-email" label="Email" type="email" value={values.email} error={errors.email} onChange={(value) => set("email", value)} autoComplete="email" />
              <TextField id="q-phone" label="Phone" type="tel" value={values.phone} error={errors.phone} onChange={(value) => set("phone", value)} autoComplete="tel" />
              <TextField id="q-city" label="City" value={values.city} error={errors.city} onChange={(value) => set("city", value)} autoComplete="address-level2" />
              <TextField id="q-size" label="Approximate size (optional)" value={values.size ?? ""} error={errors.size} onChange={(value) => set("size", value)} placeholder="e.g. 3,200 sq ft, 4 bed / 4 bath" />
              <TextField id="q-timing" label="Desired timing (optional)" value={values.timing ?? ""} error={errors.timing} onChange={(value) => set("timing", value)} placeholder="e.g. within two weeks" />
            </div>

            <div>
              <Label htmlFor="q-scope">Scope & condition</Label>
              <Textarea
                id="q-scope"
                value={values.scope}
                maxLength={1200}
                onChange={(event) => set("scope", event.target.value)}
                placeholder="Which rooms or areas, how the space is used, current condition, and anything specialized"
                className="mt-2 min-h-32"
                aria-invalid={Boolean(errors.scope)}
              />
              {errors.scope && <p className="mt-1 text-xs text-destructive" role="alert">{errors.scope}</p>}
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-ink">How should we reach you?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {contactPrefs.map((preference) => (
                  <button
                    key={preference.id}
                    type="button"
                    onClick={() => set("contactPreference", preference.id)}
                    aria-pressed={values.contactPreference === preference.id}
                    className={`min-h-11 rounded-md border px-4 py-2.5 text-sm transition-colors ${
                      values.contactPreference === preference.id
                        ? "border-moss bg-accent/50"
                        : "border-border bg-card hover:border-moss/50"
                    }`}
                  >
                    {preference.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="q-notes">Additional notes (optional)</Label>
              <Textarea
                id="q-notes"
                value={values.notes ?? ""}
                maxLength={1200}
                onChange={(event) => set("notes", event.target.value)}
                className="mt-2"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg">Photos (optional)</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You can preview photos of the space here to help describe it. In this version of the site, selected files stay on your device. Nothing is uploaded. Ask us for a secure way to send photos and we'll arrange it.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Please do not include IDs, financial documents, or other sensitive personal information in photos. You can select up to 6 images.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => addPhotos(event.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => fileRef.current?.click()}
                disabled={photos.length >= 6}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {photos.length >= 6 ? "Photo limit reached" : "Choose photos"}
              </Button>
              {photos.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <li key={photo.url} className="relative">
                      <img
                        src={photo.url}
                        alt={`Selected photo ${index + 1}: ${photo.name}`}
                        className="aspect-square w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        aria-label={`Remove ${photo.name}`}
                        className="absolute -right-2 -top-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card shadow-soft"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg">Review my request</Button>
              {ready && (
                <Button asChild size="lg" variant="outline">
                  <a href={mailtoLink(`Custom quote request: ${values.name}`, body)}>Send by email</a>
                </Button>
              )}
            </div>
            {ready && (
              <p className="rounded-lg bg-accent/40 p-4 text-sm leading-relaxed text-accent-foreground" role="status">
                Your required details are complete. Send by email opens your email app with the request filled in. Nothing is stored on this site.
              </p>
            )}
          </form>

          <aside className="rounded-xl border border-border bg-sand p-6 lg:sticky lg:top-32">
            <p className="eyebrow">Direct help</p>
            <h2 className="mt-3 text-xl">Prefer to talk it through?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Call or email directly and we'll walk through the space with you.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
              <Button asChild variant="outline"><a href={business.emailHref}>Email us</a></Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
      {error && <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
