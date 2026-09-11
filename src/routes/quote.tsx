import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, mailtoLink } from "@/config/business";
import { seo } from "@/lib/seo";

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

type PropertyType = "residential" | "commercial" | "specialty";
type ContactPreference = "phone" | "email" | "text" | "video";

interface Values {
  propertyType: PropertyType;
  name: string;
  email: string;
  phone: string;
  city: string;
  size: string;
  scope: string;
  timing: string;
  contactPreference: ContactPreference;
  notes: string;
}

type LocalPhoto = {
  name: string;
  url: string;
  size: number;
  type: string;
  fingerprint: string;
};

type ErrorKey = keyof Values | "photos";

const MAX_PHOTOS = 12;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const acceptedExtensions = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

function fileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isAcceptedImage(file: File) {
  const browserTypeAllowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.type);
  return browserTypeAllowed || acceptedExtensions.includes(fileExtension(file.name));
}

function canPreview(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type) || ["jpg", "jpeg", "png", "webp"].includes(fileExtension(file.name));
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function QuotePage() {
  const { language, text } = useLanguage();
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
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [ready, setReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<LocalPhoto[]>([]);

  const propertyTypes: { id: PropertyType; label: string; note: string }[] = [
    {
      id: "residential",
      label: text({ en: "Residential", es: "Residencial" }),
      note: text({ en: "Large, unusual, or partial-home scope", es: "Viviendas grandes, inusuales o limpieza parcial" }),
    },
    {
      id: "commercial",
      label: text({ en: "Commercial / Office", es: "Comercial / oficina" }),
      note: text({ en: "Suites, offices, light commercial", es: "Suites, oficinas y espacios comerciales ligeros" }),
    },
    {
      id: "specialty",
      label: text({ en: "Specialty", es: "Especializado" }),
      note: text({ en: "Post-renovation, unique surfaces, or other needs", es: "Después de renovación, superficies especiales u otras necesidades" }),
    },
  ];

  const contactPrefs: { id: ContactPreference; label: string }[] = [
    { id: "phone", label: text({ en: "Phone call", es: "Llamada telefónica" }) },
    { id: "email", label: text({ en: "Email", es: "Correo electrónico" }) },
    { id: "text", label: text({ en: "Text message", es: "Mensaje de texto" }) },
    { id: "video", label: text({ en: "Video consultation", es: "Consulta por video" }) },
  ];

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => {
        if (photo.url) URL.revokeObjectURL(photo.url);
      });
    },
    [],
  );

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setReady(false);
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setReady(false);
    setErrors((previous) => ({ ...previous, photos: undefined }));

    const currentFingerprints = new Set(photos.map((photo) => photo.fingerprint));
    const next: LocalPhoto[] = [];
    const messages: string[] = [];
    let totalBytes = photos.reduce((sum, photo) => sum + photo.size, 0);

    for (const file of Array.from(files)) {
      if (photos.length + next.length >= MAX_PHOTOS) {
        messages.push(text({ en: `Maximum ${MAX_PHOTOS} photos.`, es: `Máximo de ${MAX_PHOTOS} fotos.` }));
        break;
      }

      const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
      if (currentFingerprints.has(fingerprint) || next.some((photo) => photo.fingerprint === fingerprint)) {
        messages.push(text({ en: `${file.name} is already selected.`, es: `${file.name} ya está seleccionada.` }));
        continue;
      }
      if (!isAcceptedImage(file)) {
        messages.push(text({ en: `${file.name} is not a supported image type.`, es: `${file.name} no es un tipo de imagen compatible.` }));
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        messages.push(text({ en: `${file.name} is larger than 8 MB.`, es: `${file.name} supera los 8 MB.` }));
        continue;
      }
      if (totalBytes + file.size > MAX_TOTAL_BYTES) {
        messages.push(text({ en: "Selected photos would exceed the 50 MB total limit.", es: "Las fotos seleccionadas superarían el límite total de 50 MB." }));
        break;
      }

      totalBytes += file.size;
      next.push({
        name: file.name,
        size: file.size,
        type: file.type || `image/${fileExtension(file.name)}`,
        fingerprint,
        url: canPreview(file) ? URL.createObjectURL(file) : "",
      });
    }

    if (next.length) setPhotos((previous) => [...previous, ...next]);
    if (messages.length) setErrors((previous) => ({ ...previous, photos: messages.join(" ") }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((previous) => {
      const target = previous[index];
      if (target?.url) URL.revokeObjectURL(target.url);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
    setReady(false);
  }

  function validate() {
    const next: Partial<Record<ErrorKey, string>> = {};
    const required = text({ en: "Required", es: "Obligatorio" });
    if (values.name.trim().length < 2) next.name = required;
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = text({ en: "Enter a valid email address", es: "Ingresa un correo electrónico válido" });
    if (values.phone.replace(/\D/g, "").length < 10) next.phone = text({ en: "Enter a valid phone number", es: "Ingresa un número de teléfono válido" });
    if (values.city.trim().length < 2) next.city = required;
    if (values.scope.trim().length < 10) next.scope = text({ en: "Tell us a little more about the scope", es: "Cuéntanos un poco más sobre el alcance" });
    setErrors(next);
    const valid = Object.keys(next).length === 0;
    setReady(valid);
    return valid;
  }

  const propertyLabel = propertyTypes.find((item) => item.id === values.propertyType)?.label ?? values.propertyType;
  const contactLabel = contactPrefs.find((item) => item.id === values.contactPreference)?.label ?? values.contactPreference;

  const body = useMemo(() => {
    if (language === "es") {
      return [
        "SOLICITUD DE COTIZACIÓN / CONSULTA",
        "",
        `Tipo de propiedad: ${propertyLabel}`,
        `Nombre: ${values.name}`,
        `Correo electrónico: ${values.email}`,
        `Teléfono: ${values.phone}`,
        `Ciudad: ${values.city}`,
        `Tamaño aproximado: ${values.size || "no proporcionado"}`,
        `Contacto preferido: ${contactLabel}`,
        `Fecha o periodo deseado: ${values.timing || "flexible"}`,
        "",
        "ALCANCE Y CONDICIÓN",
        values.scope,
        "",
        "NOTAS ADICIONALES",
        values.notes || "ninguna",
        photos.length ? `\nEl cliente seleccionó ${photos.length} foto(s) localmente para compartirlas cuando se solicite.` : "",
        "",
        "Las fotos seleccionadas no se adjuntan ni se cargan desde este sitio web.",
      ].join("\n");
    }
    return [
      "CUSTOM QUOTE / CONSULTATION REQUEST",
      "",
      `Property type: ${propertyLabel}`,
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `City: ${values.city}`,
      `Approximate size: ${values.size || "not provided"}`,
      `Preferred contact: ${contactLabel}`,
      `Desired timing: ${values.timing || "flexible"}`,
      "",
      "SCOPE & CONDITION",
      values.scope,
      "",
      "ADDITIONAL NOTES",
      values.notes || "none",
      photos.length ? `\nCustomer selected ${photos.length} photo(s) locally to share on request.` : "",
      "",
      "Selected photos are not attached or uploaded from this website.",
    ].join("\n");
  }, [contactLabel, language, photos.length, propertyLabel, values]);

  const selectedBytes = photos.reduce((sum, photo) => sum + photo.size, 0);

  return (
    <>
      <PageHero
        eyebrow={text({ en: "Custom quote", es: "Cotización personalizada" })}
        title={text({ en: "Get a custom quote or virtual consultation", es: "Obtén una cotización personalizada o una consulta virtual" })}
        intro={text({
          en: "For larger homes, partial-home scope, specialty work, and commercial spaces. These are situations a standard estimate should not decide on its own.",
          es: "Para viviendas grandes, limpieza parcial del hogar, trabajo especializado y espacios comerciales. Estas situaciones necesitan una revisión directa en lugar de depender solamente de un estimado estándar.",
        })}
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
          <form noValidate onSubmit={(event) => { event.preventDefault(); validate(); }} className="space-y-8">
            <fieldset>
              <legend className="text-lg">{text({ en: "What kind of property?", es: "¿Qué tipo de propiedad es?" })}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {propertyTypes.map((property) => (
                  <button key={property.id} type="button" onClick={() => set("propertyType", property.id)} aria-pressed={values.propertyType === property.id} className={`min-h-24 rounded-lg border p-4 text-left transition-colors ${values.propertyType === property.id ? "border-moss bg-accent/40" : "border-border bg-card hover:border-moss/50"}`}>
                    <span className="block text-sm font-medium text-ink">{property.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{property.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="q-name" label={text({ en: "Full name", es: "Nombre completo" })} value={values.name} error={errors.name} onChange={(value) => set("name", value)} autoComplete="name" />
              <TextField id="q-email" label={text({ en: "Email", es: "Correo electrónico" })} type="email" value={values.email} error={errors.email} onChange={(value) => set("email", value)} autoComplete="email" />
              <TextField id="q-phone" label={text({ en: "Phone", es: "Teléfono" })} type="tel" value={values.phone} error={errors.phone} onChange={(value) => set("phone", value)} autoComplete="tel" />
              <TextField id="q-city" label={text({ en: "City", es: "Ciudad" })} value={values.city} error={errors.city} onChange={(value) => set("city", value)} autoComplete="address-level2" />
              <TextField id="q-size" label={text({ en: "Approximate size (optional)", es: "Tamaño aproximado (opcional)" })} value={values.size} error={errors.size} onChange={(value) => set("size", value)} placeholder={text({ en: "e.g. 3,200 sq ft, 4 bed / 4 bath", es: "Ej. 3,200 pies², 4 dormitorios / 4 baños" })} />
              <TextField id="q-timing" label={text({ en: "Desired timing (optional)", es: "Fecha o periodo deseado (opcional)" })} value={values.timing} error={errors.timing} onChange={(value) => set("timing", value)} placeholder={text({ en: "e.g. within two weeks", es: "Ej. dentro de dos semanas" })} />
            </div>

            <div>
              <Label htmlFor="q-scope">{text({ en: "Scope & condition", es: "Alcance y condición" })}</Label>
              <Textarea id="q-scope" value={values.scope} maxLength={1200} onChange={(event) => set("scope", event.target.value)} placeholder={text({ en: "Which rooms or areas, how the space is used, current condition, and anything specialized", es: "Qué habitaciones o áreas, cómo se usa el espacio, su condición actual y cualquier necesidad especial" })} className="mt-2 min-h-32" aria-invalid={Boolean(errors.scope)} />
              {errors.scope && <p className="mt-1 text-xs text-destructive" role="alert">{errors.scope}</p>}
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-ink">{text({ en: "How should we reach you?", es: "¿Cómo prefieres que nos comuniquemos contigo?" })}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {contactPrefs.map((preference) => (
                  <button key={preference.id} type="button" onClick={() => set("contactPreference", preference.id)} aria-pressed={values.contactPreference === preference.id} className={`min-h-11 rounded-md border px-4 py-2.5 text-sm transition-colors ${values.contactPreference === preference.id ? "border-moss bg-accent/50" : "border-border bg-card hover:border-moss/50"}`}>
                    {preference.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="q-notes">{text({ en: "Additional notes (optional)", es: "Notas adicionales (opcional)" })}</Label>
              <Textarea id="q-notes" value={values.notes} maxLength={1200} onChange={(event) => set("notes", event.target.value)} className="mt-2" />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg">{text({ en: "Photos (optional)", es: "Fotos (opcional)" })}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {text({
                  en: "You can preview photos of the space here to help describe it. Selected files stay on your device in this version. Nothing is uploaded or attached automatically. Ask us for a secure way to send photos and we will arrange it.",
                  es: "Puedes previsualizar fotos del espacio aquí para ayudar a describirlo. En esta versión, los archivos seleccionados permanecen en tu dispositivo. Nada se carga ni se adjunta automáticamente. Solicita una forma segura de enviarnos las fotos y la coordinaremos contigo.",
                })}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {text({
                  en: "JPG, PNG, WebP, HEIC, or HEIF. Up to 12 photos, 8 MB each, 50 MB total. Do not include IDs, financial documents, or other sensitive personal information.",
                  es: "JPG, PNG, WebP, HEIC o HEIF. Hasta 12 fotos, 8 MB por foto y 50 MB en total. No incluyas identificaciones, documentos financieros ni otra información personal sensible.",
                })}
              </p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple className="sr-only" onChange={(event) => addPhotos(event.target.files)} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()} disabled={photos.length >= MAX_PHOTOS || selectedBytes >= MAX_TOTAL_BYTES}>
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {photos.length >= MAX_PHOTOS ? text({ en: "Photo limit reached", es: "Límite de fotos alcanzado" }) : text({ en: "Choose photos", es: "Elegir fotos" })}
                </Button>
                <span className="text-xs text-muted-foreground">{photos.length}/{MAX_PHOTOS} · {formatBytes(selectedBytes)} / 50 MB</span>
              </div>
              {errors.photos && <p className="mt-3 text-xs font-medium text-destructive" role="alert">{errors.photos}</p>}
              {photos.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {photos.map((photo, index) => (
                    <li key={photo.fingerprint} className="relative overflow-hidden rounded-xl border border-border bg-muted">
                      {photo.url ? (
                        <img src={photo.url} alt={text({ en: `Selected photo ${index + 1}: ${photo.name}`, es: `Foto seleccionada ${index + 1}: ${photo.name}` })} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center p-4 text-center text-xs text-muted-foreground">{photo.name}<br />{text({ en: "Preview not supported by this browser", es: "Este navegador no admite la vista previa" })}</div>
                      )}
                      <button type="button" onClick={() => removePhoto(index)} aria-label={text({ en: `Remove ${photo.name}`, es: `Eliminar ${photo.name}` })} className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/95 text-ink shadow-soft">
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg">{text({ en: "Review my request", es: "Revisar mi solicitud" })}</Button>
              {ready && (
                <Button asChild size="lg" variant="outline">
                  <a href={mailtoLink(language === "es" ? `Solicitud de cotización: ${values.name}` : `Custom quote request: ${values.name}`, body)}>{text({ en: "Send by email", es: "Enviar por correo" })}</a>
                </Button>
              )}
            </div>
            {ready && (
              <p className="rounded-lg bg-accent/40 p-4 text-sm leading-relaxed text-accent-foreground" role="status">
                {text({
                  en: "Your required details are complete. Send by email opens your email app with the request filled in. Nothing is stored on this site.",
                  es: "Los datos obligatorios están completos. Enviar por correo abre tu aplicación de correo con la solicitud preparada. Nada se guarda en este sitio.",
                })}
              </p>
            )}
          </form>

          <aside className="rounded-xl border border-border bg-sand p-6 lg:sticky lg:top-32">
            <p className="eyebrow">{text({ en: "Direct help", es: "Ayuda directa" })}</p>
            <h2 className="mt-3 text-xl">{text({ en: "Prefer to talk it through?", es: "¿Prefieres hablarlo directamente?" })}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text({ en: "Call or email directly and we will walk through the space with you.", es: "Llámanos o envíanos un correo y revisaremos el espacio contigo." })}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild><a href={business.phoneHref}>{text({ en: "Call", es: "Llama al" })} {business.phoneDisplay}</a></Button>
              <Button asChild variant="outline"><a href={business.emailHref}>{text({ en: "Email us", es: "Envíanos un correo" })}</a></Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function TextField({ id, label, value, onChange, error, type = "text", autoComplete, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} className="mt-2" />
      {error && <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
