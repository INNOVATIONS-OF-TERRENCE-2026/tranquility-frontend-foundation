import { Check, Info } from "lucide-react";

import { materialOptions, productPreferenceOptions } from "@/config/studio";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MaterialProfile, ProductPreference } from "@/types/studio";

const materialLabels: Record<keyof MaterialProfile, { title: string; note: string }> = {
  flooring: { title: "Flooring", note: "Select everything found in the home." },
  countertops: { title: "Countertops", note: "Unsure is completely fine. We can confirm later." },
  metals: { title: "Metals and finishes", note: "Used as service context, not as a cleaning procedure promise." },
  sensitiveSurfaces: { title: "Sensitive surfaces", note: "Selections here may require custom review before service." },
};

export function SurfaceProfile({
  materials,
  productPreferences,
  productNotes,
  onMaterialsChange,
  onProductPreferencesChange,
  onProductNotesChange,
}: {
  materials: MaterialProfile;
  productPreferences: ProductPreference[];
  productNotes: string;
  onMaterialsChange: (materials: MaterialProfile) => void;
  onProductPreferencesChange: (preferences: ProductPreference[]) => void;
  onProductNotesChange: (notes: string) => void;
}) {
  function toggleMaterial(group: keyof MaterialProfile, value: string) {
    const active = materials[group].includes(value);
    onMaterialsChange({
      ...materials,
      [group]: active ? materials[group].filter((item) => item !== value) : [...materials[group], value],
    });
  }

  function toggleProduct(value: ProductPreference) {
    onProductPreferencesChange(
      productPreferences.includes(value)
        ? productPreferences.filter((item) => item !== value)
        : [...productPreferences, value],
    );
  }

  return (
    <div>
      <p className="eyebrow">Surface awareness</p>
      <h2 className="mt-2 text-3xl">Tell us what your home is made of</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Material details help communicate what should be handled carefully. This profile collects context only and does not assume a cleaning procedure.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {(Object.keys(materialOptions) as (keyof MaterialProfile)[]).map((group) => (
          <fieldset key={group} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <legend className="px-1 text-lg font-medium text-ink">{materialLabels[group].title}</legend>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{materialLabels[group].note}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {materialOptions[group].map((option) => {
                const active = materials[group].includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleMaterial(group, option)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "border-moss bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-moss/60"
                    }`}
                  >
                    {active && <Check className="size-3" aria-hidden="true" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-oak" aria-hidden="true" />
          <div>
            <h3 className="text-xl">Product preferences</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose the preferences that matter to your household. Requests are reviewed before service and are not claims of health, antimicrobial, hypoallergenic, or product certification.
            </p>
          </div>
        </div>

        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Product preference options</legend>
          {productPreferenceOptions.map((option) => {
            const active = productPreferences.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  active ? "border-moss bg-accent/45" : "border-border bg-card"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleProduct(option.id)}
                  className="size-4 accent-[var(--moss)]"
                />
                <span className="font-medium text-ink">{option.label}</span>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-5">
          <Label htmlFor="studio-product-notes">Product or sensitivity notes</Label>
          <Textarea
            id="studio-product-notes"
            value={productNotes}
            maxLength={700}
            onChange={(event) => onProductNotesChange(event.target.value)}
            placeholder="Fragrance preferences, customer-provided products, or special surface-product instructions"
            className="mt-2 min-h-28"
          />
        </div>
      </div>
    </div>
  );
}
