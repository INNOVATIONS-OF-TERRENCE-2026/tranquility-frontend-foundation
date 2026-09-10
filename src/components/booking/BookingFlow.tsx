import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Info, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { useStudioTransfer } from "@/components/studio/StudioTransferProvider";
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
  PRICING_DISCLOSURE,
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

const steps = ["Cleaning type", "Frequency", "Home and scope", "Add-ons", "Schedule and contact", "Review"] as const;
const arrivalWindows = ["Morning", "Midday", "Afternoon", "Flexible"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(25),
  address: z.string().trim().min(4, "Enter your street address").max(160),
  city: z.string().trim().min(2, "Enter your city").max(80),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  date: z.string().min(1, "Choose a preferred date"),
  window: z.string().min(1, "Choose a preferred arrival window"),
});

type ContactValues = z.infer<typeof contactSchema>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingFlow({ initialService }: { initialService?: ServiceId }) {
  const { draft, clearDraft } = useStudioTransfer();
  const [importedFromStudio] = useState(Boolean(draft));
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceId>(initialService ?? draft?.service ?? "standard");
  const [frequency, setFrequency] = useState<FrequencyId>(draft?.frequency ?? "onetime");
  const [scope, setScope] = useState<ScopeCounts>(draft ? { ...draft.scope } : { ...defaultScope });
  const [sqft, setSqft] = useState(draft?.squareFeet ?? "");
  const [partialHome, setPartialHome] = useState(draft?.partialHome ?? false);
  const [pets, setPets] = useState<"yes" | "no">("no");
  const [petDetails, setPetDetails] = useState("");
  const [petError, setPetError] = useState("");
  const [otherSpaces, setOtherSpaces] = useState("");
  const [notes, setNotes] = useState("");
  const [extras, setExtras] = useState<Record<string, number>>(draft ? { ...draft.extras } : {});
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
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});

  useEffect(() => {
    if (draft) clearDraft();
  }, [draft, clearDraft]);

  const sqftNumber = sqft ? Number(sqft) : null;
  const estimate = useMemo(
    () => buildEstimate({ service, frequency, scope, extras, sqft: sqftNumber, partialHome }),
    [service, frequency, scope, extras, sqftNumber, partialHome],
  );

  function setExtra(id: string, quantity: number) {
    setExtras((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function validateContact() {
    const result = contactSchema.safeParse(contact);
    const next: Partial<Record<keyof ContactValues, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) next[issue.path[0] as keyof ContactValues] = issue.message;
    }
    if (contact.date && contact.date < todayISO()) next.date = "Please choose today or a future date";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (step === 2 && pets === "yes" && petDetails.trim().length < 2) {
      setPetError("Please add a brief note about your pet or pets.");
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

  const emailBody = useMemo(() => {
    const lines = [
      "SERVICE REQUEST | Tranquility Level Cleaning",
      "",
      `Service: ${estimate.service.name}`,
      `Frequency: ${estimate.frequency.name} (${estimate.frequency.note})`,
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
      `Approximate square footage: ${sqft || "Not provided"}`,
      `Partial-home request: ${partialHome ? "Yes" : "No"}`,
      `Pets: ${pets === "yes" ? petDetails : "No"}`,
      `Other or special spaces: ${otherSpaces || "None"}`,
      `Condition and service notes: ${notes || "None"}`,
      "",
      "APPROVED ADD-ONS AND ROOM CHARGES",
      ...(estimate.addOnLines.length
        ? estimate.addOnLines.map(
            (line) => `${line.label} x ${line.qty}: ${line.startingAt ? "starting at " : ""}${money(line.total)}`,
          )
        : ["None"]),
      `Add-on total: ${money(estimate.addOnTotal)}`,
      `Estimated total: ${money(estimate.total)}`,
      ...(estimate.reviewFlags.length
        ? ["", "CUSTOM REVIEW ITEMS", ...estimate.reviewFlags.map((flag) => `- ${flag}`)]
        : []),
      "",
      "CONTACT",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Address: ${contact.address}, ${contact.city}, TX ${contact.zip}`,
      `Preferred date: ${contact.date}`,
      `Preferred arrival window: ${contact.window}`,
      "",
      "This is a customer-generated website request. Final service details and pricing remain subject to confirmation.",
    ];
    return lines.join("\n");
  }, [contact, estimate, notes, otherSpaces, partialHome, petDetails, pets, scope, sqft]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0">
        {importedFromStudio && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-moss/40 bg-accent/45 p-4 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Tranquility Studio plan imported</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Cleaning type, frequency, priced room quantities, add-ons, and square footage were transferred in memory. Personal household notes and photos were not transferred or stored.
              </p>
            </div>
          </div>
        )}

        <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Service request progress">
          {steps.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? "step" : undefined}
              className={`flex items-center gap-1.5 ${index === step ? "font-semibold text-moss" : "text-muted-foreground"}`}
            >
              <span
                className={`inline-flex size-6 items-center justify-center rounded-full border text-[0.7rem] ${
                  index < step
                    ? "border-moss bg-moss text-primary-foreground"
                    : index === step
                      ? "border-moss bg-accent"
                      : "border-border bg-card"
                }`}
              >
                {index < step ? <Check className="size-3" aria-hidden="true" /> : index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <fieldset>
            <legend className="text-2xl">Choose your cleaning type</legend>
            <p className="mt-2 text-sm text-muted-foreground">Published pricing is based on a standard average 1-bedroom, 1-full-bath home.</p>
            <div className="mt-6 grid gap-4">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setService(item.id)}
                  aria-pressed={service === item.id}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    service === item.id ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"
                  }`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-lg font-semibold text-ink">{item.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.description}</span>
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
            <legend className="text-2xl">How often would you like service?</legend>
            <p className="mt-2 text-sm text-muted-foreground">Recurring savings apply to the service subtotal only. Add-ons remain at their listed rate.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {frequencies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFrequency(item.id)}
                  aria-pressed={frequency === item.id}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    frequency === item.id ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"
                  }`}
                >
                  <span className="block text-lg font-semibold text-ink">{item.name}</span>
                  <span className="mt-1 block text-xs text-moss">{item.note}</span>
                  <span className="mt-4 block font-display text-3xl text-ink">{money(servicePrice(service, item.id))}</span>
                  <span className="text-xs text-muted-foreground">base service per visit</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl">Your home and cleaning scope</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Base pricing includes {BASE_BEDROOMS} bedroom and {BASE_FULL_BATHS} full bathroom. Additional room charges are derived from the quantities below, so they are counted once.
            </p>

            <div className="mt-6 grid gap-3">
              <QuantityField
                label="Bedrooms to clean"
                value={scope.bedrooms}
                min={1}
                onChange={(value) => setScope((current) => ({ ...current, bedrooms: value }))}
                hint="1 included in base price"
                price={`+${money(addOnPrice(getAddOn("extra-bedroom"), service))} each additional`}
              />
              <QuantityField
                label="Full bathrooms to clean"
                value={scope.fullBaths}
                min={1}
                onChange={(value) => setScope((current) => ({ ...current, fullBaths: value }))}
                hint="1 included in base price"
                price={`starting at +${money(addOnPrice(getAddOn("extra-full-bath"), service))} each additional`}
              />
              <QuantityField
                label="Half bathrooms"
                value={scope.halfBaths}
                onChange={(value) => setScope((current) => ({ ...current, halfBaths: value }))}
                price={`+${money(addOnPrice(getAddOn("half-bath"), service))} each`}
              />
              <QuantityField
                label="Additional living rooms"
                value={scope.livingRooms}
                onChange={(value) => setScope((current) => ({ ...current, livingRooms: value }))}
                price={`+${money(addOnPrice(getAddOn("living-room"), service))} each`}
              />
              <QuantityField
                label="Dining rooms"
                value={scope.diningRooms}
                onChange={(value) => setScope((current) => ({ ...current, diningRooms: value }))}
                price={`+${money(addOnPrice(getAddOn("dining-room"), service))} each`}
              />
              <QuantityField
                label="Offices"
                value={scope.offices}
                onChange={(value) => setScope((current) => ({ ...current, offices: value }))}
                price={`+${money(addOnPrice(getAddOn("office"), service))} each`}
              />
              <QuantityField
                label="Laundry or utility rooms"
                value={scope.laundryRooms}
                onChange={(value) => setScope((current) => ({ ...current, laundryRooms: value }))}
                price={`+${money(addOnPrice(getAddOn("laundry-room"), service))} each`}
              />
            </div>

            <div className="mt-7 grid gap-6">
              <div className="max-w-sm">
                <Label htmlFor="booking-sqft">Approximate square footage, for review only</Label>
                <Input
                  id="booking-sqft"
                  inputMode="numeric"
                  value={sqft}
                  onChange={(event) => setSqft(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Example: 1800"
                  className="mt-2"
                />
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  We do not price by square footage. Around {CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and above is treated as custom-review territory.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <input
                  type="checkbox"
                  checked={partialHome}
                  onChange={(event) => setPartialHome(event.target.checked)}
                  className="mt-1 size-4 accent-[var(--moss)]"
                />
                <span>
                  <span className="font-semibold text-ink">I only want part of my home cleaned</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    Partial-home requests in a larger property are custom scope and may be better handled through a consultation.
                  </span>
                </span>
              </label>

              <fieldset>
                <legend className="text-sm font-medium text-ink">Pets in the home?</legend>
                <div className="mt-2 flex gap-3">
                  {(["no", "yes"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setPets(value);
                        if (value === "no") setPetError("");
                      }}
                      aria-pressed={pets === value}
                      className={`min-h-11 min-w-24 rounded-md border px-4 py-2.5 text-sm font-semibold capitalize ${
                        pets === value ? "border-moss bg-accent" : "border-border bg-card"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {pets === "yes" && (
                  <div className="mt-4">
                    <Label htmlFor="booking-pet-details">Tell us about your pets</Label>
                    <Textarea
                      id="booking-pet-details"
                      value={petDetails}
                      maxLength={500}
                      onChange={(event) => {
                        setPetDetails(event.target.value);
                        setPetError("");
                      }}
                      aria-invalid={Boolean(petError)}
                      placeholder="Type, temperament, and where they will be during service"
                      className="mt-2"
                    />
                    {petError && <p className="mt-1 text-xs font-medium text-destructive" role="alert">{petError}</p>}
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Pets may remain if they are not a distraction or hindrance. Anxious, aggressive, or disruptive animals should be safely secured during service.
                </p>
              </fieldset>

              <div>
                <Label htmlFor="booking-other-spaces">Other or special spaces</Label>
                <Textarea
                  id="booking-other-spaces"
                  value={otherSpaces}
                  maxLength={500}
                  onChange={(event) => setOtherSpaces(event.target.value)}
                  placeholder="Sunroom, bonus room, finished garage, or another space"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="booking-notes">Condition and service notes</Label>
                <Textarea
                  id="booking-notes"
                  value={notes}
                  maxLength={1000}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Surfaces, product preferences, access details, areas to skip, or anything else we should understand"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl">Choose approved add-ons</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              These are optional extras beyond the rooms already counted in your scope. Prices update for the selected cleaning type where applicable.
            </p>
            <div className="mt-6 grid gap-3 xl:grid-cols-2">
              {selectableAddOns.map((addOn) => {
                const quantity = extras[addOn.id] ?? 0;
                if (addOn.quantity) {
                  return (
                    <QuantityField
                      key={addOn.id}
                      label={addOn.name}
                      value={quantity}
                      max={12}
                      onChange={(value) => setExtra(addOn.id, value)}
                      price={`+${money(addOnPrice(addOn, service))} per ${addOn.unit ?? "item"}`}
                    />
                  );
                }
                const active = quantity > 0;
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() => setExtra(addOn.id, active ? 0 : 1)}
                    aria-pressed={active}
                    className={`flex min-h-16 items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors ${
                      active ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink">{addOn.name}</span>
                      <span className="mt-1 block text-xs text-moss">
                        {addOn.startingAt ? "starting at " : ""}+{money(addOnPrice(addOn, service))}
                      </span>
                    </span>
                    <span
                      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-moss bg-moss text-primary-foreground" : "border-border"
                      }`}
                      aria-hidden="true"
                    >
                      {active && <Check className="size-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Items labeled starting at are minimum prices and may be adjusted after review.</p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl">Schedule and contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Choose a preferred date and general arrival window. This does not reserve an appointment. Availability is confirmed directly with you.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field id="booking-name" label="Full name" value={contact.name} error={errors.name} autoComplete="name" onChange={(value) => setContact((current) => ({ ...current, name: value }))} />
              <Field id="booking-email" label="Email" type="email" value={contact.email} error={errors.email} autoComplete="email" onChange={(value) => setContact((current) => ({ ...current, email: value }))} />
              <Field id="booking-phone" label="Phone" type="tel" value={contact.phone} error={errors.phone} autoComplete="tel" onChange={(value) => setContact((current) => ({ ...current, phone: value }))} />
              <Field id="booking-address" label="Street address" value={contact.address} error={errors.address} autoComplete="street-address" onChange={(value) => setContact((current) => ({ ...current, address: value }))} />
              <Field id="booking-city" label="City" value={contact.city} error={errors.city} autoComplete="address-level2" onChange={(value) => setContact((current) => ({ ...current, city: value }))} />
              <Field id="booking-zip" label="ZIP code" value={contact.zip} error={errors.zip} autoComplete="postal-code" inputMode="numeric" onChange={(value) => setContact((current) => ({ ...current, zip: value.replace(/\D/g, "").slice(0, 5) }))} />
              <Field id="booking-date" label="Preferred date" type="date" min={todayISO()} value={contact.date} error={errors.date} onChange={(value) => setContact((current) => ({ ...current, date: value }))} />
              <div>
                <Label htmlFor="booking-window">Preferred arrival window</Label>
                <select
                  id="booking-window"
                  value={contact.window}
                  onChange={(event) => setContact((current) => ({ ...current, window: event.target.value }))}
                  aria-invalid={Boolean(errors.window)}
                  aria-describedby={errors.window ? "booking-window-error" : undefined}
                  className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-ink"
                >
                  <option value="">Select a window</option>
                  {arrivalWindows.map((window) => <option key={window} value={window}>{window}</option>)}
                </select>
                {errors.window && <p id="booking-window-error" className="mt-1 text-xs font-medium text-destructive">{errors.window}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-2xl">Review your service request</h2>
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card shadow-soft">
              <SummaryRow label="Service" value={estimate.service.name} />
              <SummaryRow label="Frequency" value={`${estimate.frequency.name} (${estimate.frequency.note})`} />
              <SummaryRow label="Service subtotal" value={money(estimate.serviceSubtotal)} />
              <SummaryRow label="Frequency savings" value={estimate.discountAmount ? money(estimate.discountAmount) : "None"} />
              <SummaryRow label="Scope" value={`${scope.bedrooms} bed, ${scope.fullBaths} full bath, ${scope.halfBaths} half bath${sqft ? `, about ${Number(sqft).toLocaleString()} sq ft` : ""}`} />
              <SummaryRow label="Pets" value={pets === "yes" ? petDetails : "No"} />
              <SummaryRow label="Contact" value={`${contact.name}, ${contact.phone}, ${contact.city} ${contact.zip}`} />
              <SummaryRow label="Preferred timing" value={`${contact.date}, ${contact.window}`} />
            </dl>

            <h3 className="mt-8 text-lg">Approved add-ons and room charges</h3>
            {estimate.addOnLines.length ? (
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card text-sm shadow-soft">
                {estimate.addOnLines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-4 px-5 py-3">
                    <span className="text-muted-foreground">{line.label} x {line.qty}{line.startingAt ? " (starting at)" : ""}</span>
                    <span className="font-semibold tabular-nums text-ink">{money(line.total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No additional priced items selected.</p>
            )}

            {estimate.reviewFlags.length > 0 && (
              <div className="mt-6 rounded-xl border border-oak/50 bg-sand p-5">
                <h3 className="flex items-center gap-2 text-base"><Info className="size-4 text-oak" aria-hidden="true" /> Custom review recommended</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {estimate.reviewFlags.map((flag) => <li key={flag}>• {flag}</li>)}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-4"><Link to="/quote">Use the custom quote flow</Link></Button>
              </div>
            )}

            <div className="mt-7 rounded-xl border border-border bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
              {PRICING_DISCLOSURE} Sending this request opens your email app with the summary prefilled. Nothing is stored on this website and no payment information is collected.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={mailtoLink(`Service request | ${estimate.service.name} | ${contact.name || "new customer"}`, emailBody)}>Open Email Request</a>
              </Button>
              <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0} className="gap-2">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Button>
          {step < steps.length - 1 && (
            <Button type="button" size="lg" onClick={goNext} className="gap-2">
              Continue <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6 shadow-lift lg:sticky lg:top-28">
        <p className="eyebrow">Your estimate</p>
        <p className="mt-3 font-display text-4xl text-ink">{money(estimate.total)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Estimated total per visit</p>
        <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Base price</dt><dd className="font-semibold tabular-nums text-ink">{money(estimate.basePrice)}</dd></div>
          {estimate.discountAmount > 0 && <div className="flex justify-between gap-4 text-moss"><dt>{estimate.frequency.name} savings</dt><dd className="font-semibold tabular-nums">-{money(estimate.discountAmount)}</dd></div>}
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Room charges and add-ons</dt><dd className="font-semibold tabular-nums text-ink">{money(estimate.addOnTotal)}</dd></div>
        </dl>
        {estimate.reviewFlags.length > 0 && <p className="mt-5 rounded-lg bg-sand p-3 text-xs leading-relaxed text-oak">Custom review is recommended for this configuration.</p>}
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{PRICING_DISCLOSURE}</p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value || "Not provided"}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  min,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        min={min}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
      {error && <p id={errorId} className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
