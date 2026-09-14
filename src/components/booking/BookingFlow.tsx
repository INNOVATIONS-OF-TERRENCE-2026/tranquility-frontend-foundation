import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Info, Mail } from "lucide-react";
import { useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { QuantityField } from "@/components/site/QuantityField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, mailtoLink } from "@/config/business";
import {
  BASE_BEDROOMS,
  BASE_FULL_BATHS,
  CUSTOM_REVIEW_SQFT,
  addOnPrice,
  buildEstimate,
  defaultScope,
  frequencies,
  getAddOn,
  money,
  selectableAddOns,
  servicePrice,
  services,
  type FrequencyId,
  type ScopeCounts,
  type ServiceId,
} from "@/config/pricing";

interface ContactValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  date: string;
  window: string;
}

type ContactKey = keyof ContactValues;

const serviceCopy: Record<ServiceId, { name: { en: string; es: string }; description: { en: string; es: string } }> = {
  standard: {
    name: { en: "Standard Clean", es: "Limpieza estándar" },
    description: {
      en: "Consistent upkeep for a home that already feels cared for.",
      es: "Mantenimiento constante para un hogar que ya recibe cuidado regular.",
    },
  },
  deep: {
    name: { en: "Deep Clean", es: "Limpieza profunda" },
    description: {
      en: "A detailed reset for homes that need more than routine upkeep.",
      es: "Una renovación detallada para hogares que necesitan más que mantenimiento rutinario.",
    },
  },
  move: {
    name: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
    description: {
      en: "Detailed cleaning for an empty or nearly empty home in transition.",
      es: "Limpieza detallada para una vivienda vacía o casi vacía durante una mudanza.",
    },
  },
};

const frequencyCopy: Record<FrequencyId, { name: { en: string; es: string }; note: { en: string; es: string } }> = {
  onetime: { name: { en: "One-time", es: "Una vez" }, note: { en: "No commitment", es: "Sin compromiso" } },
  weekly: { name: { en: "Weekly", es: "Semanal" }, note: { en: "20% savings", es: "20% de ahorro" } },
  biweekly: { name: { en: "Bi-weekly", es: "Cada dos semanas" }, note: { en: "15% savings", es: "15% de ahorro" } },
  monthly: { name: { en: "Monthly", es: "Mensual" }, note: { en: "10% savings", es: "10% de ahorro" } },
};

const addOnCopy: Record<string, { en: string; es: string }> = {
  "laundry-wdf": { en: "Laundry: wash, dry & fold", es: "Lavandería: lavar, secar y doblar" },
  "laundry-fold": { en: "Laundry: fold only", es: "Lavandería: solo doblar" },
  dishes: { en: "Excess dishes", es: "Exceso de platos" },
  oven: { en: "Oven interior", es: "Interior del horno" },
  fridge: { en: "Refrigerator interior", es: "Interior del refrigerador" },
  hood: { en: "Above-stove hood & vents", es: "Campana y ventilas sobre la estufa" },
  cabinets: { en: "Cabinet interiors", es: "Interior de gabinetes" },
  "pet-hair": { en: "Excess pet hair vacuuming", es: "Aspirado de exceso de pelo de mascotas" },
  baseboards: { en: "Baseboards", es: "Zócalos" },
  "garage-patio": { en: "Garage / patio", es: "Garaje / patio" },
  "carpet-spot": { en: "Carpet spot cleaning", es: "Limpieza puntual de alfombra" },
};

const arrivalWindows = [
  { id: "morning", en: "Morning", es: "Mañana" },
  { id: "midday", en: "Midday", es: "Mediodía" },
  { id: "afternoon", en: "Afternoon", es: "Tarde" },
  { id: "flexible", en: "Flexible", es: "Flexible" },
] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingFlow({ initialService }: { initialService?: ServiceId }) {
  const { language, text } = useLanguage();
  const steps = [
    text({ en: "Cleaning type", es: "Tipo de limpieza" }),
    text({ en: "Frequency", es: "Frecuencia" }),
    text({ en: "Home and scope", es: "Hogar y alcance" }),
    text({ en: "Add-ons", es: "Adicionales" }),
    text({ en: "Schedule and contact", es: "Horario y contacto" }),
    text({ en: "Review", es: "Revisión" }),
  ];

  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceId>(initialService ?? "standard");
  const [frequency, setFrequency] = useState<FrequencyId>("onetime");
  const [scope, setScope] = useState<ScopeCounts>({ ...defaultScope });
  const [sqft, setSqft] = useState("");
  const [partialHome, setPartialHome] = useState(false);
  const [pets, setPets] = useState<"yes" | "no">("no");
  const [petDetails, setPetDetails] = useState("");
  const [petError, setPetError] = useState("");
  const [otherSpaces, setOtherSpaces] = useState("");
  const [notes, setNotes] = useState("");
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [contact, setContact] = useState<ContactValues>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    date: "",
    window: "",
  });
  const [errors, setErrors] = useState<Partial<Record<ContactKey, string>>>({});

  const sqftNumber = sqft ? Number(sqft) : null;
  const estimate = useMemo(
    () => buildEstimate({ service, frequency, scope, extras, sqft: sqftNumber, partialHome }),
    [service, frequency, scope, extras, sqftNumber, partialHome],
  );

  const reviewItems = useMemo(() => {
    const items: string[] = [];
    if (sqftNumber && sqftNumber >= CUSTOM_REVIEW_SQFT) {
      items.push(text({
        en: `Homes around ${CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and larger require custom review.`,
        es: `Las viviendas de aproximadamente ${CUSTOM_REVIEW_SQFT.toLocaleString()} pies cuadrados o más requieren una revisión personalizada.`,
      }));
    }
    if (partialHome) {
      items.push(text({
        en: "Partial-home service is custom scope and may require a direct quote.",
        es: "La limpieza de solo una parte del hogar es un alcance personalizado y puede requerir una cotización directa.",
      }));
    }
    if (estimate.hasStartingAt) {
      items.push(text({
        en: "One or more selected items use starting-at pricing and may change after review.",
        es: "Uno o más servicios seleccionados usan un precio inicial y pueden cambiar después de la revisión.",
      }));
    }
    return items;
  }, [estimate.hasStartingAt, partialHome, sqftNumber, text]);

  function setExtra(id: string, quantity: number) {
    setExtras((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function updateContact(key: ContactKey, value: string) {
    setContact((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateContact() {
    const next: Partial<Record<ContactKey, string>> = {};
    const required = text({ en: "Required", es: "Obligatorio" });
    if (contact.name.trim().length < 2) next.name = required;
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) next.email = text({ en: "Enter a valid email address", es: "Ingresa un correo electrónico válido" });
    if (contact.phone.replace(/\D/g, "").length < 10) next.phone = text({ en: "Enter a valid phone number", es: "Ingresa un número de teléfono válido" });
    if (contact.address.trim().length < 4) next.address = required;
    if (contact.city.trim().length < 2) next.city = required;
    if (!/^\d{5}$/.test(contact.zip)) next.zip = text({ en: "Enter a 5-digit ZIP code", es: "Ingresa un código postal de 5 dígitos" });
    if (!contact.date) next.date = required;
    else if (contact.date < todayISO()) next.date = text({ en: "Choose today or a future date", es: "Elige hoy o una fecha futura" });
    if (!contact.window) next.window = required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (step === 2 && pets === "yes" && petDetails.trim().length < 2) {
      setPetError(text({ en: "Please add a brief note about your pet or pets.", es: "Agrega una nota breve sobre tu mascota o mascotas." }));
      return;
    }
    setPetError("");
    if (step === 4 && !validateContact()) return;
    setStep((current) => Math.min(steps.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const serviceLabel = text(serviceCopy[service].name);
  const frequencyLabel = text(frequencyCopy[frequency].name);
  const selectedWindow = arrivalWindows.find((item) => item.id === contact.window);

  const emailBody = useMemo(() => {
    const yes = language === "es" ? "Sí" : "Yes";
    const no = language === "es" ? "No" : "No";
    const none = language === "es" ? "Ninguno" : "None";
    const notProvided = language === "es" ? "No proporcionado" : "Not provided";
    const lines = language === "es"
      ? [
          "SOLICITUD DE SERVICIO | Tranquility Level Cleaning",
          "",
          `Servicio: ${serviceLabel}`,
          `Frecuencia: ${frequencyLabel}`,
          `Subtotal del servicio: ${money(estimate.serviceSubtotal)}`,
          `Ahorro por frecuencia: ${money(estimate.discountAmount)}`,
          "",
          "ALCANCE",
          `Dormitorios: ${scope.bedrooms}`,
          `Baños completos: ${scope.fullBaths}`,
          `Medios baños: ${scope.halfBaths}`,
          `Salas adicionales: ${scope.livingRooms}`,
          `Comedores: ${scope.diningRooms}`,
          `Oficinas: ${scope.offices}`,
          `Lavanderías / cuartos de servicio: ${scope.laundryRooms}`,
          `Pies cuadrados aproximados: ${sqft || notProvided}`,
          `Solicitud parcial del hogar: ${partialHome ? yes : no}`,
          `Mascotas: ${pets === "yes" ? petDetails : no}`,
          `Otros espacios: ${otherSpaces || none}`,
          `Notas: ${notes || none}`,
          "",
          "SERVICIOS ADICIONALES Y CARGOS POR HABITACIÓN",
          ...(estimate.addOnLines.length
            ? estimate.addOnLines.map((line) => `${addOnCopy[line.id]?.es ?? line.label} x ${line.qty}: ${line.startingAt ? "desde " : ""}${money(line.total)}`)
            : [none]),
          `Total de adicionales: ${money(estimate.addOnTotal)}`,
          `Total estimado: ${money(estimate.total)}`,
          ...(reviewItems.length ? ["", "ELEMENTOS PARA REVISIÓN", ...reviewItems.map((item) => `- ${item}`)] : []),
          "",
          "CONTACTO",
          `Nombre: ${contact.name}`,
          `Correo electrónico: ${contact.email}`,
          `Teléfono: ${contact.phone}`,
          `Dirección: ${contact.address}, ${contact.city}, TX ${contact.zip}`,
          `Fecha preferida: ${contact.date}`,
          `Horario preferido: ${selectedWindow?.es ?? contact.window}`,
          "",
          "Esta solicitud fue creada por el cliente en el sitio web. Los detalles finales del servicio y el precio están sujetos a confirmación.",
        ]
      : [
          "SERVICE REQUEST | Tranquility Level Cleaning",
          "",
          `Service: ${serviceLabel}`,
          `Frequency: ${frequencyLabel}`,
          `Service subtotal: ${money(estimate.serviceSubtotal)}`,
          `Frequency savings: ${money(estimate.discountAmount)}`,
          "",
          "SCOPE",
          `Bedrooms to clean: ${scope.bedrooms}`,
          `Full bathrooms to clean: ${scope.fullBaths}`,
          `Half bathrooms: ${scope.halfBaths}`,
          `Additional living rooms: ${scope.livingRooms}`,
          `Dining rooms: ${scope.diningRooms}`,
          `Offices: ${scope.offices}`,
          `Laundry or utility rooms: ${scope.laundryRooms}`,
          `Approximate square footage: ${sqft || notProvided}`,
          `Partial-home request: ${partialHome ? yes : no}`,
          `Pets: ${pets === "yes" ? petDetails : no}`,
          `Other or special spaces: ${otherSpaces || none}`,
          `Condition and service notes: ${notes || none}`,
          "",
          "APPROVED ADD-ONS AND ROOM CHARGES",
          ...(estimate.addOnLines.length
            ? estimate.addOnLines.map((line) => `${addOnCopy[line.id]?.en ?? line.label} x ${line.qty}: ${line.startingAt ? "starting at " : ""}${money(line.total)}`)
            : [none]),
          `Add-on total: ${money(estimate.addOnTotal)}`,
          `Estimated total: ${money(estimate.total)}`,
          ...(reviewItems.length ? ["", "CUSTOM REVIEW ITEMS", ...reviewItems.map((item) => `- ${item}`)] : []),
          "",
          "CONTACT",
          `Name: ${contact.name}`,
          `Email: ${contact.email}`,
          `Phone: ${contact.phone}`,
          `Address: ${contact.address}, ${contact.city}, TX ${contact.zip}`,
          `Preferred date: ${contact.date}`,
          `Preferred arrival window: ${selectedWindow?.en ?? contact.window}`,
          "",
          "This is a customer-generated website request. Final service details and pricing remain subject to confirmation.",
        ];
    return lines.join("\n");
  }, [contact, estimate, frequencyLabel, language, notes, otherSpaces, partialHome, petDetails, pets, reviewItems, scope, selectedWindow, serviceLabel, sqft]);

  const mailto = mailtoLink(
    language === "es" ? `Solicitud de servicio | ${contact.name || "Cliente"}` : `Service request | ${contact.name || "Customer"}`,
    emailBody,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <div className="min-w-0">
        <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label={text({ en: "Service request progress", es: "Progreso de la solicitud" })}>
          {steps.map((label, index) => (
            <li key={label} aria-current={index === step ? "step" : undefined} className={`flex items-center gap-1.5 ${index === step ? "font-semibold text-moss" : "text-muted-foreground"}`}>
              <span className={`inline-flex size-6 items-center justify-center rounded-full border text-[0.7rem] ${index < step ? "border-moss bg-moss text-primary-foreground" : index === step ? "border-moss bg-accent" : "border-border bg-card"}`}>
                {index < step ? <Check className="size-3" aria-hidden="true" /> : index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <fieldset>
            <legend className="text-2xl">{text({ en: "Choose your cleaning type", es: "Elige tu tipo de limpieza" })}</legend>
            <p className="mt-2 text-sm text-muted-foreground">{text({ en: "Published pricing is based on a standard average 1-bedroom, 1-full-bath home.", es: "Los precios publicados se basan en una vivienda estándar promedio de 1 dormitorio y 1 baño completo." })}</p>
            <div className="mt-6 grid gap-4">
              {services.map((item) => (
                <button key={item.id} type="button" onClick={() => setService(item.id)} aria-pressed={service === item.id} className={`rounded-xl border p-5 text-left transition-colors ${service === item.id ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"}`}>
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-lg font-semibold text-ink">{text(serviceCopy[item.id].name)}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text(serviceCopy[item.id].description)}</span>
                    </span>
                    <span className="shrink-0 font-display text-2xl text-ink">{money(item.basePrice)}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-2xl">{text({ en: "How often would you like service?", es: "¿Con qué frecuencia deseas el servicio?" })}</legend>
            <p className="mt-2 text-sm text-muted-foreground">{text({ en: "Recurring savings apply to the service subtotal only. Add-ons remain at their listed rate.", es: "Los descuentos recurrentes se aplican solo al subtotal del servicio. Los servicios adicionales conservan su precio publicado." })}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {frequencies.map((item) => (
                <button key={item.id} type="button" onClick={() => setFrequency(item.id)} aria-pressed={frequency === item.id} className={`rounded-xl border p-5 text-left transition-colors ${frequency === item.id ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"}`}>
                  <span className="block text-lg font-semibold text-ink">{text(frequencyCopy[item.id].name)}</span>
                  <span className="mt-1 block text-xs text-moss">{text(frequencyCopy[item.id].note)}</span>
                  <span className="mt-4 block font-display text-3xl text-ink">{money(servicePrice(service, item.id))}</span>
                  <span className="text-xs text-muted-foreground">{text({ en: "base service per visit", es: "servicio base por visita" })}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl">{text({ en: "Your home and cleaning scope", es: "Tu hogar y el alcance de la limpieza" })}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text({ en: `Base pricing includes ${BASE_BEDROOMS} bedroom and ${BASE_FULL_BATHS} full bathroom. Additional room charges are derived from the quantities below so they are counted once.`, es: `El precio base incluye ${BASE_BEDROOMS} dormitorio y ${BASE_FULL_BATHS} baño completo. Los cargos por habitaciones adicionales se calculan con las cantidades siguientes para evitar cargos duplicados.` })}</p>

            <div className="mt-6 grid gap-3">
              <QuantityField label={text({ en: "Bedrooms to clean", es: "Dormitorios a limpiar" })} value={scope.bedrooms} min={1} onChange={(value) => setScope((current) => ({ ...current, bedrooms: value }))} hint={text({ en: "1 included in base price", es: "1 incluido en el precio base" })} price={`+${money(addOnPrice(getAddOn("extra-bedroom"), service))} ${text({ en: "each additional", es: "cada adicional" })}`} />
              <QuantityField label={text({ en: "Full bathrooms to clean", es: "Baños completos a limpiar" })} value={scope.fullBaths} min={1} onChange={(value) => setScope((current) => ({ ...current, fullBaths: value }))} hint={text({ en: "1 included in base price", es: "1 incluido en el precio base" })} price={`${text({ en: "starting at", es: "desde" })} +${money(addOnPrice(getAddOn("extra-full-bath"), service))} ${text({ en: "each additional", es: "cada adicional" })}`} />
              <QuantityField label={text({ en: "Half bathrooms", es: "Medios baños" })} value={scope.halfBaths} onChange={(value) => setScope((current) => ({ ...current, halfBaths: value }))} price={`+${money(addOnPrice(getAddOn("half-bath"), service))} ${text({ en: "each", es: "cada uno" })}`} />
              <QuantityField label={text({ en: "Additional living rooms", es: "Salas adicionales" })} value={scope.livingRooms} onChange={(value) => setScope((current) => ({ ...current, livingRooms: value }))} price={`+${money(addOnPrice(getAddOn("living-room"), service))} ${text({ en: "each", es: "cada una" })}`} />
              <QuantityField label={text({ en: "Dining rooms", es: "Comedores" })} value={scope.diningRooms} onChange={(value) => setScope((current) => ({ ...current, diningRooms: value }))} price={`+${money(addOnPrice(getAddOn("dining-room"), service))} ${text({ en: "each", es: "cada uno" })}`} />
              <QuantityField label={text({ en: "Offices", es: "Oficinas" })} value={scope.offices} onChange={(value) => setScope((current) => ({ ...current, offices: value }))} price={`+${money(addOnPrice(getAddOn("office"), service))} ${text({ en: "each", es: "cada una" })}`} />
              <QuantityField label={text({ en: "Laundry or utility rooms", es: "Lavanderías o cuartos de servicio" })} value={scope.laundryRooms} onChange={(value) => setScope((current) => ({ ...current, laundryRooms: value }))} price={`+${money(addOnPrice(getAddOn("laundry-room"), service))} ${text({ en: "each", es: "cada uno" })}`} />
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="booking-sqft">{text({ en: "Approximate square footage, for review only", es: "Pies cuadrados aproximados, solo para revisión" })}</Label>
                <Input id="booking-sqft" inputMode="numeric" value={sqft} onChange={(event) => setSqft(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={text({ en: "Example: 1800", es: "Ejemplo: 1800" })} className="mt-2" />
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text({ en: `We do not price by square footage. Around ${CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and above requires custom review.`, es: `No calculamos el precio por pies cuadrados. Aproximadamente ${CUSTOM_REVIEW_SQFT.toLocaleString()} pies cuadrados o más requiere una revisión personalizada.` })}</p>
              </div>
              <label className="flex min-h-24 cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
                <input type="checkbox" checked={partialHome} onChange={(event) => setPartialHome(event.target.checked)} className="mt-1 size-4" />
                <span><span className="block text-sm font-semibold text-ink">{text({ en: "I only want part of the home cleaned", es: "Solo quiero limpiar parte del hogar" })}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{text({ en: "Partial-home requests are reviewed as custom scope.", es: "Las solicitudes para limpiar solo parte del hogar se revisan como un alcance personalizado." })}</span></span>
              </label>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-semibold text-ink">{text({ en: "Pets in the home?", es: "¿Hay mascotas en el hogar?" })}</legend>
                <div className="mt-3 flex gap-3">
                  {(["no", "yes"] as const).map((value) => (
                    <button key={value} type="button" onClick={() => setPets(value)} aria-pressed={pets === value} className={`min-h-11 rounded-full border px-5 text-sm font-semibold ${pets === value ? "border-moss bg-accent text-ink" : "border-border bg-card text-muted-foreground"}`}>{value === "yes" ? text({ en: "Yes", es: "Sí" }) : text({ en: "No", es: "No" })}</button>
                  ))}
                </div>
                {pets === "yes" && <div className="mt-4"><Label htmlFor="pet-details">{text({ en: "Pet type and anything we should know", es: "Tipo de mascota y cualquier detalle importante" })}</Label><Input id="pet-details" value={petDetails} onChange={(event) => setPetDetails(event.target.value)} className="mt-2" />{petError && <p className="mt-1 text-xs text-destructive">{petError}</p>}</div>}
              </fieldset>
              <div>
                <Label htmlFor="other-spaces">{text({ en: "Other or special spaces", es: "Otros espacios o áreas especiales" })}</Label>
                <Input id="other-spaces" value={otherSpaces} onChange={(event) => setOtherSpaces(event.target.value)} placeholder={text({ en: "Example: playroom, stairs, sunroom", es: "Ejemplo: sala de juegos, escaleras, terraza cerrada" })} className="mt-2" />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="service-notes">{text({ en: "Condition or service notes", es: "Notas sobre la condición o el servicio" })}</Label>
              <Textarea id="service-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={text({ en: "Share anything that will help us understand the space.", es: "Comparte cualquier detalle que nos ayude a entender el espacio." })} className="mt-2 min-h-28" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl">{text({ en: "Choose optional add-ons", es: "Elige servicios adicionales opcionales" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text({ en: "Room charges from the previous step are calculated automatically. Use this step only for optional detail work.", es: "Los cargos por habitaciones del paso anterior se calculan automáticamente. Usa este paso solo para trabajos detallados opcionales." })}</p>
            <div className="mt-6 grid gap-3">
              {selectableAddOns.map((addOn) => {
                const qty = extras[addOn.id] ?? 0;
                const price = addOnPrice(addOn, service);
                const label = addOnCopy[addOn.id] ? text(addOnCopy[addOn.id]!) : addOn.name;
                return (
                  <div key={addOn.id} className={`rounded-xl border p-4 ${qty > 0 ? "border-moss bg-accent/35" : "border-border bg-card"}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{addOn.startingAt ? text({ en: "Starting at ", es: "Desde " }) : ""}{money(price)}{addOn.unit ? ` ${text({ en: `per ${addOn.unit}`, es: addOn.unit === "load" ? "por carga" : `por ${addOn.unit}` })}` : ""}</p>
                      </div>
                      {addOn.quantity ? (
                        <QuantityField label={label} value={qty} onChange={(value) => setExtra(addOn.id, value)} min={0} max={10} />
                      ) : (
                        <button type="button" onClick={() => setExtra(addOn.id, qty ? 0 : 1)} aria-pressed={qty > 0} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${qty > 0 ? "border-moss bg-moss text-primary-foreground" : "border-border text-ink"}`}>{qty > 0 ? text({ en: "Added", es: "Agregado" }) : text({ en: "Add", es: "Agregar" })}</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl">{text({ en: "Schedule preference and contact", es: "Preferencia de horario y contacto" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text({ en: "This sends a service request. Your preferred date and window are not confirmed until Tranquility follows up.", es: "Esto envía una solicitud de servicio. La fecha y el horario preferidos no quedan confirmados hasta que Tranquility se comunique contigo." })}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label={text({ en: "Full name", es: "Nombre completo" })} error={errors.name}><Input value={contact.name} onChange={(event) => updateContact("name", event.target.value)} autoComplete="name" /></Field>
              <Field label={text({ en: "Email", es: "Correo electrónico" })} error={errors.email}><Input type="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} autoComplete="email" /></Field>
              <Field label={text({ en: "Phone", es: "Teléfono" })} error={errors.phone}><Input type="tel" value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} autoComplete="tel" /></Field>
              <Field label={text({ en: "Street address", es: "Dirección" })} error={errors.address}><Input value={contact.address} onChange={(event) => updateContact("address", event.target.value)} autoComplete="street-address" /></Field>
              <Field label={text({ en: "City", es: "Ciudad" })} error={errors.city}><Input value={contact.city} onChange={(event) => updateContact("city", event.target.value)} autoComplete="address-level2" /></Field>
              <Field label={text({ en: "ZIP code", es: "Código postal" })} error={errors.zip}><Input value={contact.zip} onChange={(event) => updateContact("zip", event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" autoComplete="postal-code" /></Field>
              <Field label={text({ en: "Preferred date", es: "Fecha preferida" })} error={errors.date}><Input type="date" min={todayISO()} value={contact.date} onChange={(event) => updateContact("date", event.target.value)} /></Field>
              <Field label={text({ en: "Preferred arrival window", es: "Horario de llegada preferido" })} error={errors.window}>
                <select value={contact.window} onChange={(event) => updateContact("window", event.target.value)} className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
                  <option value="">{text({ en: "Choose a window", es: "Elige un horario" })}</option>
                  {arrivalWindows.map((item) => <option key={item.id} value={item.id}>{language === "es" ? item.es : item.en}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-2xl">{text({ en: "Review your request", es: "Revisa tu solicitud" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text({ en: "Nothing is submitted automatically. The button below opens a prefilled email in your mail app so you can review it before sending.", es: "Nada se envía automáticamente. El botón de abajo abre un correo prellenado en tu aplicación de correo para que puedas revisarlo antes de enviarlo." })}</p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ReviewCard title={text({ en: "Service", es: "Servicio" })} lines={[serviceLabel, frequencyLabel, `${scope.bedrooms} ${text({ en: "bedroom(s)", es: "dormitorio(s)" })}`, `${scope.fullBaths} ${text({ en: "full bath(s)", es: "baño(s) completo(s)" })}`]} />
              <ReviewCard title={text({ en: "Contact", es: "Contacto" })} lines={[contact.name, contact.email, contact.phone, `${contact.address}, ${contact.city}, TX ${contact.zip}`, `${contact.date} · ${language === "es" ? selectedWindow?.es : selectedWindow?.en}`]} />
            </div>

            {reviewItems.length > 0 && (
              <div className="mt-6 rounded-xl border border-moss/35 bg-accent/35 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink"><Info className="size-4 text-moss" aria-hidden="true" />{text({ en: "Review needed", es: "Se requiere revisión" })}</div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">{reviewItems.map((item) => <li key={item}>• {item}</li>)}</ul>
                <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/quote">{text({ en: "Open custom quote instead", es: "Abrir cotización personalizada" })}</Link></Button>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg"><a href={mailto}><Mail className="size-4" aria-hidden="true" />{text({ en: "Open email request", es: "Abrir solicitud por correo" })}</a></Button>
              <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>{text({ en: "Call", es: "Llama al" })} {business.phoneDisplay}</a></Button>
            </div>
          </div>
        )}

        <div className="mt-9 flex items-center justify-between gap-4 border-t border-border pt-6">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={goBack}><ArrowLeft className="size-4" aria-hidden="true" />{text({ en: "Back", es: "Atrás" })}</Button>
          {step < steps.length - 1 && <Button type="button" size="lg" onClick={goNext}>{text({ en: "Continue", es: "Continuar" })}<ArrowRight className="size-4" aria-hidden="true" /></Button>}
        </div>
      </div>

      <aside className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-lift lg:sticky lg:top-32">
        <p className="eyebrow">{text({ en: "Your estimate", es: "Tu estimado" })}</p>
        <h3 className="mt-2 text-2xl">{serviceLabel}</h3>
        <div className="mt-5 space-y-3 border-y border-border py-4 text-sm">
          <SummaryRow label={text({ en: "Base", es: "Base" })} value={money(estimate.basePrice)} />
          {estimate.discountAmount > 0 && <SummaryRow label={text({ en: "Recurring savings", es: "Ahorro recurrente" })} value={`-${money(estimate.discountAmount)}`} />}
          <SummaryRow label={text({ en: "Service subtotal", es: "Subtotal del servicio" })} value={money(estimate.serviceSubtotal)} />
          <SummaryRow label={text({ en: "Rooms and add-ons", es: "Habitaciones y adicionales" })} value={money(estimate.addOnTotal)} />
        </div>
        <div className="mt-5 flex items-end justify-between gap-4"><span className="text-sm font-semibold text-ink">{text({ en: "Estimated total", es: "Total estimado" })}</span><span className="font-display text-4xl text-ink">{money(estimate.total)}</span></div>
        {estimate.hasStartingAt && <p className="mt-2 text-xs text-moss">{text({ en: "Includes one or more starting-at items.", es: "Incluye uno o más servicios con precio inicial." })}</p>}
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{text({ en: "This is an estimate, not a confirmed appointment or final invoice. Final service details and pricing are confirmed before cleaning.", es: "Este es un estimado, no una cita confirmada ni una factura final. Los detalles y el precio final se confirman antes de la limpieza." })}</p>
      </aside>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-ink">{label}</span>{children}{error && <span className="mt-1 block text-xs text-destructive">{error}</span>}</label>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="font-semibold tabular-nums text-ink">{value}</span></div>;
}

function ReviewCard({ title, lines }: { title: string; lines: (string | undefined)[] }) {
  return <div className="rounded-xl border border-border bg-card p-5"><h3 className="text-lg">{title}</h3><div className="mt-3 space-y-1 text-sm text-muted-foreground">{lines.filter(Boolean).map((line) => <p key={line}>{line}</p>)}</div></div>;
}
