import { Clipboard, Download, Printer, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { paletteById, styleOptions } from "@/config/studio";
import { buildStudioEstimate, blueprintText, studioReviewFlags } from "@/lib/studio";
import type { StudioState } from "@/types/studio";

export function Blueprint({ state }: { state: StudioState }) {
  const [status, setStatus] = useState("");
  const estimate = buildStudioEstimate(state);
  const reviewFlags = studioReviewFlags(state);
  const palette = paletteById(state.paletteId);
  const primaryStyle = styleOptions.find((style) => style.id === state.primaryStyle)?.label;

  async function copyBlueprint() {
    try {
      await navigator.clipboard.writeText(blueprintText(state));
      setStatus("Blueprint copied to your clipboard.");
    } catch {
      setStatus(
        "Copy was unavailable in this browser. You can still print or download the blueprint.",
      );
    }
  }

  function downloadBlueprint() {
    try {
      const blob = new Blob([blueprintText(state)], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tranquility-home-care-blueprint.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Blueprint download prepared in your browser.");
    } catch {
      setStatus("Download was unavailable. You can still copy or print the blueprint.");
    }
  }

  function printBlueprint() {
    window.print();
    setStatus("Print dialog opened.");
  }

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Final profile</p>
          <h2 className="mt-2 text-4xl">Tranquility Home Care Blueprint</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A browser-generated planning summary of your cleaning scope, home preferences, and
            items that may need a consultation. Nothing in this blueprint is stored on the website.
          </p>
        </div>
        <div className="rounded-xl border border-moss/40 bg-accent/45 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Estimated total
          </p>
          <p className="mt-1 font-display text-4xl text-ink">
            ${estimate.total.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-muted-foreground">
            per visit, before any custom review adjustment
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <BlueprintSection title="Service plan">
          <dl className="space-y-3 text-sm">
            <Pair label="Cleaning type" value={estimate.service.name} />
            <Pair
              label="Frequency"
              value={`${estimate.frequency.name} (${estimate.frequency.note})`}
            />
            <Pair
              label="Base service subtotal"
              value={`$${estimate.serviceSubtotal.toLocaleString("en-US")}`}
            />
            <Pair
              label="Approved room charges and add-ons"
              value={`$${estimate.addOnTotal.toLocaleString("en-US")}`}
            />
            <Pair
              label="Approximate square footage"
              value={state.squareFeet || "Not provided"}
            />
          </dl>
        </BlueprintSection>

        <BlueprintSection title="Interior preference profile">
          <p className="text-sm text-muted-foreground">
            Primary style:{" "}
            <span className="font-semibold text-ink">{primaryStyle ?? "Not selected"}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Palette: <span className="font-semibold text-ink">{palette?.name ?? "Not selected"}</span>
          </p>
          {(palette || state.customColors.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Selected palette colors">
              {[...(palette?.colors ?? []), ...state.customColors].map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-ink"
                >
                  <span
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  {color.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </BlueprintSection>

        <BlueprintSection title="Rooms included">
          <ul className="space-y-3">
            {state.rooms
              .filter((room) => room.included)
              .map((room) => (
                <li key={room.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{room.label}</span>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {room.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Focus:{" "}
                    {room.focusAreas.length
                      ? room.focusAreas.join(", ")
                      : "No specific focus selected"}
                  </p>
                  {room.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Notes: {room.notes}
                    </p>
                  )}
                </li>
              ))}
          </ul>
        </BlueprintSection>

        <BlueprintSection title="Rooms excluded">
          {state.rooms.some((room) => !room.included) ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {state.rooms
                .filter((room) => !room.included)
                .map((room) => (
                  <li key={room.id}>• {room.label}</li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No configured rooms are excluded.</p>
          )}
        </BlueprintSection>

        <BlueprintSection title="Materials and surface awareness">
          <dl className="space-y-3 text-sm">
            <Pair
              label="Flooring"
              value={state.materials.flooring.join(", ") || "Not specified"}
            />
            <Pair
              label="Countertops"
              value={state.materials.countertops.join(", ") || "Not specified"}
            />
            <Pair
              label="Metals and finishes"
              value={state.materials.metals.join(", ") || "Not specified"}
            />
            <Pair
              label="Sensitive surfaces"
              value={state.materials.sensitiveSurfaces.join(", ") || "None noted"}
            />
          </dl>
        </BlueprintSection>

        <BlueprintSection title="Household and product context">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Pets:{" "}
              <span className="font-semibold text-ink">
                {state.household.pets ? state.household.petTypes || "Yes" : "No"}
              </span>
            </p>
            <p>
              Product preferences:{" "}
              <span className="font-semibold text-ink">
                {state.productPreferences.join(", ") || "None selected"}
              </span>
            </p>
            {state.productNotes && (
              <p>
                Product notes: <span className="text-ink">{state.productNotes}</span>
              </p>
            )}
            {state.household.notes && (
              <p>
                Household notes: <span className="text-ink">{state.household.notes}</span>
              </p>
            )}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Please Leave These Areas Alone">
          <p className="text-sm text-muted-foreground">
            {state.protectedItems.join(", ") || "No protected categories selected"}
          </p>
          {state.protectedNotes && (
            <p className="mt-3 text-sm leading-relaxed text-ink">{state.protectedNotes}</p>
          )}
        </BlueprintSection>

        <BlueprintSection title="Items requiring review">
          {reviewFlags.length ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {reviewFlags.map((flag) => (
                <li key={flag}>• {flag}</li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-moss" aria-hidden="true" />
              No additional Studio review flags are currently identified.
            </div>
          )}
        </BlueprintSection>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">
        <Button type="button" onClick={copyBlueprint} className="gap-2">
          <Clipboard className="size-4" aria-hidden="true" /> Copy Blueprint
        </Button>
        <Button type="button" variant="outline" onClick={printBlueprint} className="gap-2">
          <Printer className="size-4" aria-hidden="true" /> Print Blueprint
        </Button>
        <Button type="button" variant="outline" onClick={downloadBlueprint} className="gap-2">
          <Download className="size-4" aria-hidden="true" /> Download Blueprint
        </Button>
      </div>
      {status && (
        <p className="mt-3 text-sm text-moss" role="status">
          {status}
        </p>
      )}
    </div>
  );
}

function BlueprintSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-5">
      <h3 className="text-xl">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-ink sm:text-right">{value}</dd>
    </div>
  );
}
