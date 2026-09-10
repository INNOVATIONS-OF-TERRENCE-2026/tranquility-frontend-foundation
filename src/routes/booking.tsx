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
      title: "Request Cleaning Service — Tranquility Level Cleaning",
      description:
        "Build your cleaning estimate in a few steps: choose your service, frequency, scope and add-ons, then send your request. Serving Dallas–Fort Worth.",
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
];

const windows = [
  "Morning (8am–11am)",
  "Midday (11am–2pm)",
  "Afternoon (2pm–5pm)",
  "Flexible",
] as const;

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
    window: "",
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

  const setExtra = (id: string, qty: number) =>
    setExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

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

  function goNext() {
    if (step === 4 && !validateContact()) return;
    setStep((s) => Math.min(stepLabels.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const summaryBody = useMemo(() => {
    const lines = [
      "SERVICE REQUEST — Tranquility Level Cleaning",
      "",
      `Service: ${estimate.service.name}`,
      `Frequency: ${estimate.frequency.name} (${estimate.frequency.note})`,
      `Service price: ${money(estimate.serviceSubtotal)}${
        estimate.discountAmount > 0 ? ` (saves ${money(estimate.discountAmount)})` : ""
      }`,
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
      `Pets: ${pets}${petDetails ? ` — ${petDetails}` : ""}`,
      `Other spaces: ${otherSpaces || "none"}`,
      `Condition / notes: ${notes || "none"}`,
      "",
      "ADD-ONS & ADDITIONAL ROOMS",
      ...(estimate.addOnLines.length
        ? estimate.addOnLines.map(
            (l) =>
              `${l.label} × ${l.qty} — ${l.startingAt ? "starting at " : ""}${money(l.total)}`,
          )
        : ["None selected"]),
      "",
      `Add-on total: ${money(estimate.addOnTotal)}`,
      `Estimated total: ${money(estimate.total)}`,
      ...(estimate.reviewFlags.length
        ? ["", "CUSTOM REVIEW FLAGS", ...estimate.reviewFlags.map((f) => `- ${f}`)]
        : []),
      "",
      "CONTACT",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Address: ${contact.address}, ${contact.city} TX ${contact.zip}`,
      `Preferred date: ${contact.date}`,
      `Preferred arrival window: ${contact.window}`,
      "",
      "Estimate generated on the Tranquility website. Pricing is based on a standard average home and may change after review.",
    ];
    return lines.join("\n");
  }, [estimate, scope, sqft, partialHome, pets, petDetails, otherSpaces, notes, contact]);

  return (
    <>
      <PageHero
        eyebrow="Request service"
        title="Build your cleaning request"
        intro="Six short steps. You'll see your estimate before anything is sent — no payment details are collected."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            {/* Progress */}
            <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Progress">
              {stepLabels.map((label, i) => (
                <li
                  key={label}
                  aria-current={i === step ? "step" : undefined}
                  className={`flex items-center gap-1.5 ${
                    i === step ? "font-semibold text-moss" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full border text-[0.65rem] ${
                      i < step
                        ? "border-moss bg-moss text-primary-foreground"
                        : i === step
                          ? "border-moss"
                          : "border-border"
                    }`}
                  >
                    {i < step ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <fieldset>
                <legend className="text-2xl">Choose your cleaning type</legend>
                <div className="mt-6 grid gap-4">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setService(s.id)}
                      aria-pressed={service === s.id}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        service === s.id
                          ? "border-moss bg-accent/40"
                          : "border-border bg-card hover:border-moss/50"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-lg">{s.name}</h3>
                        <span className="font-semibold text-ink">From {money(s.basePrice)}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="text-2xl">How often?</legend>
                <p className="mt-2 text-sm text-muted-foreground">
                  Savings apply to the {services.find((s) => s.id === service)?.name} price only,
                  never to add-ons.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {frequencies.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrequency(f.id)}
                      aria-pressed={frequency === f.id}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        frequency === f.id
                          ? "border-moss bg-accent/40"
                          : "border-border bg-card hover:border-moss/50"
                      }`}
                    >
                      <h3 className="text-lg">{f.name}</h3>
                      <p className="text-xs text-moss">{f.note}</p>
                      <p className="mt-3 font-display text-2xl text-ink">
                        {money(servicePrice(service, f.id))}
                      </p>
                      <p className="text-xs text-muted-foreground">per visit, base home</p>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl">Your home & scope</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Base pricing includes {BASE_BEDROOMS} bedroom and {BASE_FULL_BATHS} full
                  bathroom. Anything beyond that is added below — counted once, never twice.
                </p>

                <div className="mt-6 grid gap-3">
                  <QuantityField
                    label="Bedrooms to clean"
                    value={scope.bedrooms}
                    min={1}
                    onChange={(v) => setScope((s) => ({ ...s, bedrooms: v }))}
                    hint="1 included in base price"
                    price={`+${money(addOnPrice({ id: "", name: "", group: "scope", price: { standard: 15, deep: 27, move: 37 } }, service))} each additional`}
                  />
                  <QuantityField
                    label="Full bathrooms to clean"
                    value={scope.fullBaths}
                    min={1}
                    onChange={(v) => setScope((s) => ({ ...s, fullBaths: v }))}
                    hint="1 included in base price"
                    price={`starting at +${money({ standard: 17, deep: 29, move: 39 }[service])} each additional`}
                  />
                  <QuantityField
                    label="Half bathrooms"
                    value={scope.halfBaths}
                    onChange={(v) => setScope((s) => ({ ...s, halfBaths: v }))}
                    price={`+${money({ standard: 13, deep: 25, move: 37 }[service])} each`}
                  />
                  <QuantityField
                    label="Additional living rooms"
                    value={scope.livingRooms}
                    onChange={(v) => setScope((s) => ({ ...s, livingRooms: v }))}
                    price="+$15 each"
                  />
                  <QuantityField
                    label="Dining rooms"
                    value={scope.diningRooms}
                    onChange={(v) => setScope((s) => ({ ...s, diningRooms: v }))}
                    price="+$15 each"
                  />
                  <QuantityField
                    label="Offices"
                    value={scope.offices}
                    onChange={(v) => setScope((s) => ({ ...s, offices: v }))}
                    price="+$12 each"
                  />
                  <QuantityField
                    label="Laundry / utility rooms"
                    value={scope.laundryRooms}
                    onChange={(v) => setScope((s) => ({ ...s, laundryRooms: v }))}
                    price={`+${money({ standard: 10, deep: 17, move: 22 }[service])} each`}
                  />
                </div>

                <div className="mt-6 grid gap-5">
                  <div>
                    <Label htmlFor="sqft">Approximate square footage (for review only)</Label>
                    <Input
                      id="sqft"
                      inputMode="numeric"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                      placeholder="e.g. 1400"
                      className="mt-2"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      We don't price by square footage. It only helps us understand the home —
                      around {CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and above we'll review
                      your request as custom scope.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                    <input
                      type="checkbox"
                      checked={partialHome}
                      onChange={(e) => setPartialHome(e.target.checked)}
                      className="mt-1 size-4 accent-[var(--moss)]"
                    />
                    <span>
                      <span className="font-medium text-ink">
                        I only want part of my home cleaned
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        For example, one bedroom and two bathrooms in a larger home. This is custom
                        scope and will be confirmed with a consultation.
                      </span>
                    </span>
                  </label>

                  <fieldset>
                    <legend className="text-sm font-medium text-ink">Pets in the home?</legend>
                    <div className="mt-2 flex gap-3">
                      {(["no", "yes"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setPets(v)}
                          aria-pressed={pets === v}
                          className={`min-w-24 rounded-md border px-4 py-2.5 text-sm capitalize ${
                            pets === v ? "border-moss bg-accent/50" : "border-border bg-card"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    {pets === "yes" && (
                      <div className="mt-3">
                        <Label htmlFor="petDetails">Tell us about your pets</Label>
                        <Textarea
                          id="petDetails"
                          value={petDetails}
                          maxLength={500}
                          onChange={(e) => setPetDetails(e.target.value)}
                          placeholder="Type, temperament, where they'll be during service"
                          className="mt-2"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Pets may stay with us if they aren't a distraction or hindrance. Anxious,
                      aggressive, or disruptive animals should be safely secured during service.
                    </p>
                  </fieldset>

                  <div>
                    <Label htmlFor="otherSpaces">Other or special spaces</Label>
                    <Textarea
                      id="otherSpaces"
                      value={otherSpaces}
                      maxLength={500}
                      onChange={(e) => setOtherSpaces(e.target.value)}
                      placeholder="Sunroom, bonus room, finished garage, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Condition & service notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      maxLength={1000}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything we should know — surfaces, product preferences, access, areas to skip"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl">Add-ons</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Optional extras beyond the rooms you already selected. Prices shown are for a{" "}
                  {estimate.service.name.toLowerCase()}.
                </p>

                <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Laundry
                </h3>
                <div className="mt-3 grid gap-3">
                  {selectableAddOns
                    .filter((a) => a.group === "laundry")
                    .map((a) => (
                      <QuantityField
                        key={a.id}
                        label={a.name}
                        value={extras[a.id] ?? 0}
                        max={12}
                        onChange={(v) => setExtra(a.id, v)}
                        price={`+${money(addOnPrice(a, service))} per ${a.unit}`}
                      />
                    ))}
                </div>

                <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Detail work
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectableAddOns
                    .filter((a) => a.group === "detail")
                    .map((a) => {
                      const active = (extras[a.id] ?? 0) > 0;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setExtra(a.id, active ? 0 : 1)}
                          aria-pressed={active}
                          className={`flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors ${
                            active ? "border-moss bg-accent/40" : "border-border bg-card"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-medium text-ink">{a.name}</span>
                            <span className="text-xs text-moss">
                              {a.startingAt ? "starting at " : ""}+{money(addOnPrice(a, service))}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border ${
                              active ? "border-moss bg-moss text-primary-foreground" : "border-input"
                            }`}
                          >
                            {active && <Check className="size-3.5" />}
                          </span>
                        </button>
                      );
                    })}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  “Starting at” items are a minimum price and may be adjusted after we review the
                  work involved.
                </p>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl">Schedule & contact</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a preferred date and window. Availability is confirmed with you — nothing
                  here reserves a time slot.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field
                    id="name"
                    label="Full name"
                    value={contact.name}
                    error={errors.name}
                    onChange={(v) => setContact((c) => ({ ...c, name: v }))}
                    autoComplete="name"
                  />
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={contact.email}
                    error={errors.email}
                    onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                    autoComplete="email"
                  />
                  <Field
                    id="phone"
                    label="Phone"
                    type="tel"
                    value={contact.phone}
                    error={errors.phone}
                    onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                    autoComplete="tel"
                  />
                  <Field
                    id="address"
                    label="Street address"
                    value={contact.address}
                    error={errors.address}
                    onChange={(v) => setContact((c) => ({ ...c, address: v }))}
                    autoComplete="street-address"
                  />
                  <Field
                    id="city"
                    label="City"
                    value={contact.city}
                    error={errors.city}
                    onChange={(v) => setContact((c) => ({ ...c, city: v }))}
                    autoComplete="address-level2"
                  />
                  <Field
                    id="zip"
                    label="ZIP code"
                    value={contact.zip}
                    error={errors.zip}
                    onChange={(v) => setContact((c) => ({ ...c, zip: v.replace(/\D/g, "").slice(0, 5) }))}
                    autoComplete="postal-code"
                  />
                  <Field
                    id="date"
                    label="Preferred date"
                    type="date"
                    min={todayISO()}
                    value={contact.date}
                    error={errors.date}
                    onChange={(v) => setContact((c) => ({ ...c, date: v }))}
                  />
                  <div>
                    <Label htmlFor="window">Preferred arrival window</Label>
                    <select
                      id="window"
                      value={contact.window}
                      onChange={(e) => setContact((c) => ({ ...c, window: e.target.value }))}
                      aria-invalid={Boolean(errors.window)}
                      className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="">Select a window</option>
                      {windows.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    {errors.window && (
                      <p className="mt-1 text-xs text-destructive">{errors.window}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl">Review your request</h2>
                <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
                  <Row label="Service" value={estimate.service.name} />
                  <Row
                    label="Frequency"
                    value={`${estimate.frequency.name} (${estimate.frequency.note})`}
                  />
                  <Row
                    label="Service price"
                    value={`${money(estimate.serviceSubtotal)}${
                      estimate.discountAmount > 0
                        ? ` — saves ${money(estimate.discountAmount)}`
                        : ""
                    }`}
                  />
                  <Row
                    label="Scope"
                    value={`${scope.bedrooms} bed · ${scope.fullBaths} full bath · ${scope.halfBaths} half bath${
                      sqft ? ` · ~${Number(sqft).toLocaleString()} sq ft` : ""
                    }`}
                  />
                  <Row label="Pets" value={pets === "yes" ? petDetails || "Yes" : "No"} />
                  <Row
                    label="Contact"
                    value={`${contact.name} · ${contact.phone} · ${contact.city} ${contact.zip}`}
                  />
                  <Row
                    label="Requested timing"
                    value={`${contact.date} · ${contact.window}`}
                  />
                </dl>

                <h3 className="mt-8 text-lg">Add-ons & additional rooms</h3>
                {estimate.addOnLines.length ? (
                  <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card text-sm">
                    {estimate.addOnLines.map((l) => (
                      <li key={l.id} className="flex justify-between gap-4 px-5 py-3">
                        <span>
                          {l.label} × {l.qty}
                          {l.startingAt && (
                            <span className="ml-2 text-xs text-muted-foreground">starting at</span>
                          )}
                        </span>
                        <span className="font-semibold tabular-nums">{money(l.total)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">None selected.</p>
                )}

                {estimate.reviewFlags.length > 0 && (
                  <div className="mt-6 rounded-xl border border-oak/50 bg-accent/40 p-5">
                    <h3 className="flex items-center gap-2 text-base">
                      <Info className="size-4 text-oak" aria-hidden="true" /> Needs a custom review
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {estimate.reviewFlags.map((f) => (
                        <li key={f}>— {f}</li>
                      ))}
                    </ul>
                    <Button asChild size="sm" variant="outline" className="mt-4">
                      <Link to="/quote">Request a consultation instead</Link>
                    </Button>
                  </div>
                )}

                <div className="mt-8 rounded-xl border border-border bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
                  {PRICING_DISCLOSURE} Sending this request opens your email app with the summary
                  prefilled — nothing is stored on this site, and no payment information is
                  collected.
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <a
                      href={mailtoLink(
                        `Service request — ${estimate.service.name} (${contact.name || "new customer"})`,
                        summaryBody,
                      )}
                    >
                      Send my request by email
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href={business.phoneHref}>Call {business.phoneDisplay}</a>
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </Button>
              {step < stepLabels.length - 1 && (
                <Button type="button" onClick={goNext} size="lg" className="gap-2">
                  Continue <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {/* Live estimate */}
          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <p className="eyebrow">Your estimate</p>
            <p className="mt-3 font-display text-4xl text-ink">{money(estimate.total)}</p>
            <p className="text-xs text-muted-foreground">
              {estimate.hasStartingAt ? "Starting estimate · " : ""}per visit
            </p>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{estimate.service.name}</dt>
                <dd className="tabular-nums">{money(estimate.basePrice)}</dd>
              </div>
              {estimate.discountAmount > 0 && (
                <div className="flex justify-between gap-3 text-moss">
                  <dt>{estimate.frequency.name} savings</dt>
                  <dd className="tabular-nums">−{money(estimate.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Add-ons & extra rooms</dt>
                <dd className="tabular-nums">{money(estimate.addOnTotal)}</dd>
              </div>
            </dl>
            {estimate.reviewFlags.length > 0 && (
              <p className="mt-4 rounded-md bg-accent/50 p-3 text-xs leading-relaxed text-accent-foreground">
                Custom review needed — we'll confirm this with you.
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {PRICING_DISCLOSURE}
            </p>
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
      <dd className="text-sm font-medium text-ink sm:text-right">{value || "—"}</dd>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  min?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        min={min}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
