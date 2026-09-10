import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { z } from "zod";

import { seo } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
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

const searchSchema = z.object({
  service: z.enum(["standard", "deep", "move"]).optional(),
});

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Request Cleaning Service | Tranquility Level Cleaning",
      description:
        "Build your cleaning request in a few clear steps. Choose service, frequency, scope, add-ons, and preferred timing for service across Dallas-Fort Worth.",
      path: "/booking",
    }),
  component: BookingPage,
});

const stepLabels = [
  "Cleaning type",
  "Frequency",
  "Home & scope",
  "Add-ons",
  "Schedule & contact",
  "Review",
] as const;

const arrivalPreferences = ["Morning", "Afternoon", "Flexible"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(25),
  address: z.string().trim().min(4, "Enter your street address").max(160),
  city: z.string().trim().min(2, "Enter your city").max(80),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  date: z.string().min(1, "Choose a preferred date"),
  arrival: z.string().min(1, "Choose a preferred arrival period"),
});

type ContactValues = z.infer<typeof contactSchema>;

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function BookingPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceId>(search.service ?? "standard");
  const [frequency, setFrequency] = useState<FrequencyId>("onetime");
  const [scope, setScope] = useState<ScopeCounts>({ ...defaultScope });
  const [sqft, setSqft] = useState("");
  const [partialHome, setPartialHome] = useState(false);
  const [pets, setPets] = useState<"yes" | "no">("no");
  const [petDetails, setPetDetails] = useState("");
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
    arrival: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});

  const sqftNumber = sqft ? Number(sqft) : null;
  const estimate = useMemo(
    () =>
      buildEstimate({
        service,
        frequency,
        scope,
        extras,
        sqft: sqftNumber,
        partialHome,
      }),
    [service, frequency, scope, extras, sqftNumber, partialHome],
  );

  const customReview = estimate.reviewFlags.length > 0;

  function setExtra(id: string, quantity: number) {
    setExtras((previous) => {
      const next = { ...previous };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function validateContact() {
    const result = contactSchema.safeParse(contact);
    const next: Partial<Record<keyof ContactValues, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof ContactValues] = issue.message;
      }
    }
    if (contact.date && contact.date < todayISO()) {
      next.date = "Please choose today or a future date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function advance() {
    if (step === 4 && !validateContact()) return;
    setStep((current) => Math.min(stepLabels.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retreat() {
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const summaryBody = useMemo(() => {
    const addOnSummary = estimate.addOnLines.length
      ? estimate.addOnLines.map(
          (line) =>
            `${line.label} x ${line.qty}: ${line.startingAt ? "starting at " : ""}${money(line.total)}`,
        )
      : ["None selected"];

    return [
      "SERVICE REQUEST: Tranquility Level Cleaning",
      "",
      `Service: ${estimate.service.name}`,
      `Frequency: ${estimate.frequency.name} (${estimate.frequency.note})`,
      `Service subtotal: ${money(estimate.serviceSubtotal)}`,
      estimate.discountAmount > 0 ? `Recurring savings: ${money(estimate.discountAmount)}` : "",
      "",
      "SCOPE",
      `Bedrooms: ${scope.bedrooms}`,
      `Full bathrooms: ${scope.fullBaths}`,
      `Half bathrooms: ${scope.halfBaths}`,
      `Additional living rooms: ${scope.livingRooms}`,
      `Dining rooms: ${scope.diningRooms}`,
      `Offices: ${scope.offices}`,
      `Laundry / utility rooms: ${scope.laundryRooms}`,
      `Approximate square footage: ${sqft || "not provided"}`,
      `Partial-home request: ${partialHome ? "yes" : "no"}`,
      `Pets: ${pets}${petDetails ? `, ${petDetails}` : ""}`,
      `Other spaces: ${otherSpaces || "none"}`,
      `Service notes: ${notes || "none"}`,
      "",
      "ADD-ONS & ADDITIONAL ROOMS",
      ...addOnSummary,
      "",
      `Add-on total: ${money(estimate.addOnTotal)}`,
      `Estimated total: ${money(estimate.total)}`,
      ...(customReview ? ["", "CUSTOM REVIEW", ...estimate.reviewFlags.map((flag) => `* ${flag}`)] : []),
      "",
      "CONTACT",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Address: ${contact.address}, ${contact.city}, TX ${contact.zip}`,
      `Preferred date: ${contact.date}`,
      `Preferred arrival period: ${contact.arrival}`,
      "",
      "This is a service request and estimate, not a guaranteed appointment. Final scope, timing, and pricing are confirmed before service.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [contact, customReview, estimate, notes, otherSpaces, partialHome, petDetails, pets, scope, sqft]);

  return (
    <>
      <PageHero
        eyebrow="Request service"
        title="Build your cleaning request"
        intro="Six focused steps take you from service selection to a clear review. No payment details are collected on this version of the site."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-3 text-xs" aria-label="Service request progress">
              {stepLabels.map((label, index) => (
                <li
                  key={label}
                  aria-current={index === step ? "step" : undefined}
                  className={`flex items-center gap-1.5 ${index === step ? "font-semibold text-moss" : "text-muted-foreground"}`}
                >
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full border text-[0.68rem] ${
                      index < step
                        ? "border-moss bg-moss text-primary-foreground"
                        : index === step
                          ? "border-moss"
                          : "border-border"
                    }`}
                  >
                    {index < step ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <fieldset>
                <legend className="text-2xl">Choose your cleaning type</legend>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Published prices below are the approved base prices for a standard average 1-bedroom, 1-full-bath home.
                </p>
                <div className="mt-6 grid gap-4">
                  {services.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setService(item.id)}
                      aria-pressed={service === item.id}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        service === item.id ? "border-moss bg-accent/40" : "border-border bg-card hover:border-moss/50"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <h2 className="text-xl">{item.name}</h2>
                        <span className="font-semibold text-ink">From {money(item.basePrice)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="text-2xl">Choose your frequency</legend>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recurring savings apply only to the service subtotal. Add-ons remain at their listed prices.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {frequencies.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFrequency(item.id)}
                      aria-pressed={frequency === item.id}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        frequency === item.id ? "border-moss bg-accent/40" : "border-border bg-card hover:border-moss/50"
                      }`}
                    >
                      <h2 className="text-lg">{item.name}</h2>
                      <p className="mt-1 text-xs font-semibold text-moss">{item.note}</p>
                      <p className="mt-4 font-display text-3xl text-ink">{money(servicePrice(service, item.id))}</p>
                      <p className="mt-1 text-xs text-muted-foreground">per visit, base home</p>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl">Tell us about the home</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Base pricing includes {BASE_BEDROOMS} bedroom and {BASE_FULL_BATHS} full bathroom. Additional room pricing is derived from these counts so the same room is never charged twice.
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
                  <QuantityField label="Half bathrooms" value={scope.halfBaths} onChange={(value) => setScope((current) => ({ ...current, halfBaths: value }))} price={`+${money(addOnPrice(getAddOn("half-bath"), service))} each`} />
                  <QuantityField label="Additional living rooms" value={scope.livingRooms} onChange={(value) => setScope((current) => ({ ...current, livingRooms: value }))} price={`+${money(addOnPrice(getAddOn("living-room"), service))} each`} />
                  <QuantityField label="Dining rooms" value={scope.diningRooms} onChange={(value) => setScope((current) => ({ ...current, diningRooms: value }))} price={`+${money(addOnPrice(getAddOn("dining-room"), service))} each`} />
                  <QuantityField label="Offices" value={scope.offices} onChange={(value) => setScope((current) => ({ ...current, offices: value }))} price={`+${money(addOnPrice(getAddOn("office"), service))} each`} />
                  <QuantityField label="Laundry / utility rooms" value={scope.laundryRooms} onChange={(value) => setScope((current) => ({ ...current, laundryRooms: value }))} price={`+${money(addOnPrice(getAddOn("laundry-room"), service))} each`} />
                </div>

                <div className="mt-7 grid gap-6">
                  <div>
                    <Label htmlFor="sqft">Approximate square footage</Label>
                    <Input
                      id="sqft"
                      inputMode="numeric"
                      value={sqft}
                      onChange={(event) => setSqft(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                      placeholder="e.g. 1400"
                      className="mt-2"
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      Square footage is collected for review context only. It is not used as a mathematical price multiplier. Homes around {CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and larger are flagged for custom review in this version.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                    <input type="checkbox" checked={partialHome} onChange={(event) => setPartialHome(event.target.checked)} className="mt-1 size-4" />
                    <span>
                      <span className="font-medium text-ink">I only want part of my home cleaned</span>
                      <span className="mt-1 block leading-relaxed text-muted-foreground">
                        Partial-home service is custom scope. We will review the exact rooms with you rather than applying a standard whole-home estimate.
                      </span>
                    </span>
                  </label>

                  <fieldset>
                    <legend className="text-sm font-medium text-ink">Pets in the home?</legend>
                    <div className="mt-3 flex gap-3">
                      {(["no", "yes"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPets(value)}
                          aria-pressed={pets === value}
                          className={`min-h-11 min-w-24 rounded-md border px-4 py-2.5 text-sm capitalize transition-colors ${pets === value ? "border-moss bg-accent/50" : "border-border bg-card"}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    {pets === "yes" && (
                      <div className="mt-4">
                        <Label htmlFor="pet-details">Pet details</Label>
                        <Textarea id="pet-details" value={petDetails} maxLength={500} onChange={(event) => setPetDetails(event.target.value)} placeholder="Type, temperament, and where they will be during service" className="mt-2" />
                      </div>
                    )}
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      Pets may remain if they are not a distraction or hindrance. Anxious, aggressive, or disruptive animals should be safely secured during service.
                    </p>
                  </fieldset>

                  <div>
                    <Label htmlFor="other-spaces">Other or special spaces</Label>
                    <Textarea id="other-spaces" value={otherSpaces} maxLength={500} onChange={(event) => setOtherSpaces(event.target.value)} placeholder="Sunroom, bonus room, finished garage, or another space" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="service-notes">Condition & service notes</Label>
                    <Textarea id="service-notes" value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Surfaces, product preferences, access notes, areas to skip, or other context" className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl">Choose add-ons</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  These are optional extras beyond room charges already derived from your home scope.
                </p>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Laundry</h3>
                <div className="mt-3 grid gap-3">
                  {selectableAddOns.filter((item) => item.group === "laundry").map((item) => (
                    <QuantityField
                      key={item.id}
                      label={item.name}
                      value={extras[item.id] ?? 0}
                      max={12}
                      onChange={(value) => setExtra(item.id, value)}
                      price={`+${money(addOnPrice(item, service))} per ${item.unit}`}
                    />
                  ))}
                </div>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Detail work</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectableAddOns.filter((item) => item.group === "detail").map((item) => {
                    const active = (extras[item.id] ?? 0) > 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setExtra(item.id, active ? 0 : 1)}
                        aria-pressed={active}
                        className={`flex min-h-20 items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors ${active ? "border-moss bg-accent/40" : "border-border bg-card hover:border-moss/50"}`}
                      >
                        <span>
                          <span className="block text-sm font-medium text-ink">{item.name}</span>
                          <span className="mt-1 block text-xs text-moss">
                            {item.startingAt ? "starting at " : ""}+{money(addOnPrice(item, service))}
                          </span>
                        </span>
                        <span aria-hidden="true" className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border ${active ? "border-moss bg-moss text-primary-foreground" : "border-input"}`}>
                          {active && <Check className="size-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Items labeled starting at have a minimum price and may change after the work is reviewed.
                </p>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl">Preferred timing & contact</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Tell us when you would prefer service. This is a request only. It does not reserve or guarantee an appointment time.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Full name" value={contact.name} error={errors.name} onChange={(value) => setContact((current) => ({ ...current, name: value }))} autoComplete="name" />
                  <Field id="email" label="Email" type="email" value={contact.email} error={errors.email} onChange={(value) => setContact((current) => ({ ...current, email: value }))} autoComplete="email" />
                  <Field id="phone" label="Phone" type="tel" value={contact.phone} error={errors.phone} onChange={(value) => setContact((current) => ({ ...current, phone: value }))} autoComplete="tel" />
                  <Field id="address" label="Street address" value={contact.address} error={errors.address} onChange={(value) => setContact((current) => ({ ...current, address: value }))} autoComplete="street-address" />
                  <Field id="city" label="City" value={contact.city} error={errors.city} onChange={(value) => setContact((current) => ({ ...current, city: value }))} autoComplete="address-level2" />
                  <Field id="zip" label="ZIP code" value={contact.zip} error={errors.zip} onChange={(value) => setContact((current) => ({ ...current, zip: value.replace(/\D/g, "").slice(0, 5) }))} autoComplete="postal-code" inputMode="numeric" />
                  <Field id="date" label="Preferred date" type="date" min={todayISO()} value={contact.date} error={errors.date} onChange={(value) => setContact((current) => ({ ...current, date: value }))} />
                  <div>
                    <Label htmlFor="arrival">Preferred arrival period</Label>
                    <select
                      id="arrival"
                      value={contact.arrival}
                      onChange={(event) => setContact((current) => ({ ...current, arrival: event.target.value }))}
                      aria-invalid={Boolean(errors.arrival)}
                      className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="">Select a preference</option>
                      {arrivalPreferences.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    {errors.arrival && <p className="mt-1 text-xs text-destructive" role="alert">{errors.arrival}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl">Review your request</h2>
                <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
                  <Row label="Service" value={estimate.service.name} />
                  <Row label="Frequency" value={`${estimate.frequency.name} (${estimate.frequency.note})`} />
                  <Row label="Service subtotal" value={money(estimate.serviceSubtotal)} />
                  {estimate.discountAmount > 0 && <Row label="Recurring savings" value={money(estimate.discountAmount)} />}
                  <Row label="Home scope" value={`${scope.bedrooms} bed, ${scope.fullBaths} full bath, ${scope.halfBaths} half bath${sqft ? `, about ${Number(sqft).toLocaleString()} sq ft` : ""}`} />
                  <Row label="Pets" value={pets === "yes" ? petDetails || "Yes" : "No"} />
                  <Row label="Contact" value={`${contact.name}, ${contact.phone}, ${contact.city} ${contact.zip}`} />
                  <Row label="Requested timing" value={`${contact.date}, ${contact.arrival}`} />
                </dl>

                <h3 className="mt-8 text-lg">Add-ons & additional rooms</h3>
                {estimate.addOnLines.length ? (
                  <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card text-sm">
                    {estimate.addOnLines.map((line) => (
                      <li key={line.id} className="flex justify-between gap-4 px-5 py-3">
                        <span>{line.label} x {line.qty}{line.startingAt && <span className="ml-2 text-xs text-muted-foreground">starting at</span>}</span>
                        <span className="font-semibold tabular-nums">{money(line.total)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-muted-foreground">None selected.</p>}

                {customReview && (
                  <div className="mt-6 rounded-xl border border-oak/50 bg-accent/40 p-5">
                    <h3 className="flex items-center gap-2 text-base"><Info className="size-4 text-oak" aria-hidden="true" /> Custom review needed</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {estimate.reviewFlags.map((flag) => <li key={flag} className="flex gap-2"><span aria-hidden="true">•</span><span>{flag}</span></li>)}
                    </ul>
                    <Button asChild size="sm" variant="outline" className="mt-4"><Link to="/quote">Use the custom quote flow</Link></Button>
                  </div>
                )}

                <div className="mt-8 rounded-xl border border-border bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
                  {PRICING_DISCLOSURE} Sending this request opens your email app with the summary prepared. Nothing is stored on this site and no payment information is collected.
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <a href={mailtoLink(`Service request: ${estimate.service.name} (${contact.name || "new customer"})`, summaryBody)}>Send request by email</a>
                  </Button>
                  <Button asChild size="lg" variant="outline"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
              <Button type="button" variant="ghost" onClick={retreat} disabled={step === 0} className="gap-2">
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </Button>
              {step < stepLabels.length - 1 && (
                <Button type="button" onClick={advance} size="lg" className="gap-2">
                  Continue <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-32" aria-label="Live estimate">
            <p className="eyebrow">Your estimate</p>
            <p className="mt-3 font-display text-4xl text-ink">{money(estimate.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{estimate.hasStartingAt ? "Starting estimate, " : ""}per visit</p>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{estimate.service.name}</dt><dd className="tabular-nums">{money(estimate.basePrice)}</dd></div>
              {estimate.discountAmount > 0 && <div className="flex justify-between gap-3 text-moss"><dt>{estimate.frequency.name} savings</dt><dd className="tabular-nums">-{money(estimate.discountAmount)}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Add-ons & extra rooms</dt><dd className="tabular-nums">{money(estimate.addOnTotal)}</dd></div>
            </dl>
            {customReview && <p className="mt-4 rounded-md bg-accent/50 p-3 text-xs leading-relaxed text-accent-foreground">Custom review needed. We will confirm the scope and final price with you.</p>}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{PRICING_DISCLOSURE}</p>
          </aside>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
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
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search" | "url" | "none";
}) {
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
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
      {error && <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
