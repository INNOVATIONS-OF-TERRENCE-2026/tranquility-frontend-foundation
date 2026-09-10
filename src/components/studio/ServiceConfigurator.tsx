import { Check, Info } from "lucide-react";

import {
  CUSTOM_REVIEW_SQFT,
  addOnPrice,
  frequencies,
  money,
  selectableAddOns,
  servicePrice,
  services,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";
import { QuantityField } from "@/components/site/QuantityField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ServiceConfigurator({
  service,
  frequency,
  squareFeet,
  extras,
  onServiceChange,
  onFrequencyChange,
  onSquareFeetChange,
  onExtrasChange,
}: {
  service: ServiceId;
  frequency: FrequencyId;
  squareFeet: string;
  extras: Record<string, number>;
  onServiceChange: (service: ServiceId) => void;
  onFrequencyChange: (frequency: FrequencyId) => void;
  onSquareFeetChange: (value: string) => void;
  onExtrasChange: (extras: Record<string, number>) => void;
}) {
  function setExtra(id: string, quantity: number) {
    const next = { ...extras };
    if (quantity <= 0) delete next[id];
    else next[id] = quantity;
    onExtrasChange(next);
  }

  return (
    <section className="mb-10 border-b border-border pb-10" aria-labelledby="studio-service-heading">
      <div className="flex items-start gap-3">
        <Info className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
        <div>
          <p className="eyebrow">Cleaning configuration</p>
          <h2 id="studio-service-heading" className="mt-2 text-3xl">Start with the service itself</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Studio uses the same approved pricing source as the service request flow. Interior style preferences never create unapproved charges.
          </p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-ink">Cleaning type</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {services.map((item) => {
            const active = item.id === service;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onServiceChange(item.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-moss bg-accent/50" : "border-border bg-card hover:border-moss/60"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-ink">{item.name}</span>
                  {active && <Check className="size-4 shrink-0 text-moss" aria-hidden="true" />}
                </span>
                <span className="mt-2 block font-display text-2xl text-ink">{money(item.basePrice)}</span>
                <span className="text-xs text-muted-foreground">one-time base price</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-ink">Frequency</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {frequencies.map((item) => {
            const active = item.id === frequency;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFrequencyChange(item.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-moss bg-accent/50" : "border-border bg-card hover:border-moss/60"
                }`}
              >
                <span className="block text-sm font-semibold text-ink">{item.name}</span>
                <span className="mt-0.5 block text-xs text-moss">{item.note}</span>
                <span className="mt-3 block font-display text-2xl text-ink">{money(servicePrice(service, item.id))}</span>
                <span className="text-xs text-muted-foreground">base service per visit</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="studio-square-feet">Approximate square footage, for review only</Label>
        <Input
          id="studio-square-feet"
          inputMode="numeric"
          value={squareFeet}
          onChange={(event) => onSquareFeetChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Example: 1800"
          className="mt-2"
        />
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Square footage does not drive the price formula. Around {CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and above is flagged for custom review.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl">Approved add-ons</h3>
        <p className="mt-1 text-sm text-muted-foreground">Room charges are derived from your room plan. Select only optional detail and laundry services here.</p>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
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
      </div>
    </section>
  );
}
