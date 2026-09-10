import { ShieldCheck } from "lucide-react";

import { protectedItemOptions } from "@/config/studio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HouseholdProfile as HouseholdProfileType } from "@/types/studio";

type BooleanHouseholdKey = {
  [K in keyof HouseholdProfileType]: HouseholdProfileType[K] extends boolean ? K : never;
}[keyof HouseholdProfileType];

const householdToggles: {
  key: BooleanHouseholdKey;
  label: string;
  note: string;
}[] = [
  {
    key: "childrenPresent",
    label: "Children present",
    note: "Helps us understand household traffic and room use.",
  },
  {
    key: "workFromHome",
    label: "Work-from-home household",
    note: "Useful for planning around occupied work areas.",
  },
  {
    key: "highTraffic",
    label: "High-traffic home",
    note: "Flags frequently used spaces for review.",
  },
  {
    key: "shoesOff",
    label: "Shoes-off home",
    note: "A household preference we can respect.",
  },
  {
    key: "frequentEntertaining",
    label: "Frequent entertaining",
    note: "Adds context about common-area use.",
  },
  {
    key: "shortTermRental",
    label: "Short-term rental context",
    note: "May require a custom scope discussion.",
  },
  {
    key: "olderAdultConsiderations",
    label: "Older-adult household considerations",
    note: "Share only practical service-planning preferences that are relevant to the home.",
  },
  {
    key: "accessibilityConsiderations",
    label: "Accessibility considerations",
    note: "Share only what is useful for safe service planning.",
  },
  {
    key: "fragileObjects",
    label: "Fragile objects",
    note: "Flags spaces that may need additional review.",
  },
  {
    key: "plants",
    label: "Plants",
    note: "Useful context for occupied surfaces and room layout.",
  },
  {
    key: "collections",
    label: "Collections or displays",
    note: "Helps identify items that should not be disturbed.",
  },
  {
    key: "specialtyFurnishings",
    label: "Specialty furnishings",
    note: "May require custom handling instructions.",
  },
];

export function HouseholdProfile({
  household,
  protectedItems,
  protectedNotes,
  generalNotes,
  onHouseholdChange,
  onProtectedItemsChange,
  onProtectedNotesChange,
  onGeneralNotesChange,
}: {
  household: HouseholdProfileType;
  protectedItems: string[];
  protectedNotes: string;
  generalNotes: string;
  onHouseholdChange: (profile: HouseholdProfileType) => void;
  onProtectedItemsChange: (items: string[]) => void;
  onProtectedNotesChange: (notes: string) => void;
  onGeneralNotesChange: (notes: string) => void;
}) {
  function toggleBoolean(key: BooleanHouseholdKey) {
    onHouseholdChange({ ...household, [key]: !household[key] });
  }

  function toggleProtected(item: string) {
    onProtectedItemsChange(
      protectedItems.includes(item)
        ? protectedItems.filter((value) => value !== item)
        : [...protectedItems, item],
    );
  }

  return (
    <div>
      <p className="eyebrow">Household context</p>
      <h2 className="mt-2 text-3xl">Shape the service around real life</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        These details are optional. Share only what helps Tranquility understand how your home is
        used and what should be handled carefully.
      </p>

      <section
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-soft"
        aria-labelledby="pets-heading"
      >
        <h3 id="pets-heading" className="text-xl">
          Pets
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {([false, true] as const).map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={household.pets === value}
              onClick={() => onHouseholdChange({ ...household, pets: value })}
              className={`min-h-11 min-w-24 rounded-md border px-4 py-2 text-sm font-semibold ${
                household.pets === value
                  ? "border-moss bg-accent text-accent-foreground"
                  : "border-border bg-background"
              }`}
            >
              {value ? "Yes" : "No"}
            </button>
          ))}
        </div>

        {household.pets && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="studio-pet-types">Pet type or details</Label>
              <Input
                id="studio-pet-types"
                value={household.petTypes}
                maxLength={180}
                onChange={(event) =>
                  onHouseholdChange({ ...household, petTypes: event.target.value })
                }
                placeholder="Dog, cat, multiple pets, temperament notes"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="studio-shedding">Shedding level</Label>
              <select
                id="studio-shedding"
                value={household.shedding}
                onChange={(event) =>
                  onHouseholdChange({
                    ...household,
                    shedding: event.target.value as HouseholdProfileType["shedding"],
                  })
                }
                className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-ink"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
              Pets may remain if they are not a distraction or hindrance. Anxious, aggressive, or
              disruptive animals should be safely secured during service.
            </p>
          </div>
        )}
      </section>

      <fieldset className="mt-8">
        <legend className="text-lg font-medium text-ink">Lifestyle and home context</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {householdToggles.map((item) => {
            const active = household[item.key];
            return (
              <label
                key={item.key}
                className={`cursor-pointer rounded-xl border p-4 ${
                  active ? "border-moss bg-accent/45" : "border-border bg-card"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleBoolean(item.key)}
                    className="mt-0.5 size-4 accent-[var(--moss)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{item.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {item.note}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <Label htmlFor="studio-household-notes">Household notes</Label>
        <Textarea
          id="studio-household-notes"
          value={household.notes}
          maxLength={700}
          onChange={(event) =>
            onHouseholdChange({ ...household, notes: event.target.value })
          }
          placeholder="Anything useful about access, occupied rooms, pets, fragile areas, or household routines"
          className="mt-2 min-h-28"
        />
      </div>

      <section
        className="mt-10 rounded-2xl border border-oak/50 bg-sand p-6"
        aria-labelledby="protected-heading"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-oak" aria-hidden="true" />
          <div>
            <p className="eyebrow">Protected areas</p>
            <h3 id="protected-heading" className="mt-2 text-2xl">
              Please Leave These Areas Alone
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Mark anything you do not want moved, opened, cleaned, or disturbed. These
              instructions flow directly into the Home Care Blueprint.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="sr-only">Protected item types</legend>
          <div className="flex flex-wrap gap-2">
            {protectedItemOptions.map((item) => {
              const active = protectedItems.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleProtected(item)}
                  className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium ${
                    active
                      ? "border-oak bg-card text-ink"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <Label htmlFor="studio-protected-notes">Protected-area instructions</Label>
          <Textarea
            id="studio-protected-notes"
            value={protectedNotes}
            maxLength={1000}
            onChange={(event) => onProtectedNotesChange(event.target.value)}
            placeholder="Example: leave the office desk untouched, do not open the display cabinet, skip documents on the dining table"
            className="mt-2 min-h-28 bg-card"
          />
        </div>
      </section>

      <div className="mt-8">
        <Label htmlFor="studio-general-notes">Anything else we should understand?</Label>
        <Textarea
          id="studio-general-notes"
          value={generalNotes}
          maxLength={1200}
          onChange={(event) => onGeneralNotesChange(event.target.value)}
          placeholder="Add final preferences, unusual scope, or context that does not fit elsewhere"
          className="mt-2 min-h-32"
        />
      </div>
    </div>
  );
}
