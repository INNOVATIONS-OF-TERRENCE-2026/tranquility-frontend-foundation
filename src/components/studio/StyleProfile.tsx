import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

import { palettes, styleOptions } from "@/config/studio";
import { Button } from "@/components/ui/button";
import type { PaletteId, StyleId } from "@/types/studio";

export function StyleProfile({
  selectedStyles,
  primaryStyle,
  paletteId,
  customColors,
  onStylesChange,
  onPrimaryChange,
  onPaletteChange,
  onCustomColorsChange,
}: {
  selectedStyles: StyleId[];
  primaryStyle: StyleId | null;
  paletteId: PaletteId | null;
  customColors: string[];
  onStylesChange: (styles: StyleId[]) => void;
  onPrimaryChange: (style: StyleId | null) => void;
  onPaletteChange: (palette: PaletteId | null) => void;
  onCustomColorsChange: (colors: string[]) => void;
}) {
  const [pendingColor, setPendingColor] = useState("#8b8f7a");

  function toggleStyle(style: StyleId) {
    const next = selectedStyles.includes(style)
      ? selectedStyles.filter((item) => item !== style)
      : [...selectedStyles, style];
    onStylesChange(next);
    if (!next.length) onPrimaryChange(null);
    else if (!primaryStyle || !next.includes(primaryStyle)) onPrimaryChange(next[0] ?? null);
  }

  return (
    <div>
      <p className="eyebrow">Interior profile</p>
      <h2 className="mt-2 text-3xl">Describe how your home feels</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        These selections help communicate your visual preferences and room atmosphere. They do not add design services or change cleaning prices.
      </p>

      <fieldset className="mt-8">
        <legend className="text-lg font-medium text-ink">Style preferences</legend>
        <p className="mt-1 text-sm text-muted-foreground">Choose one or more, then select the primary style that best represents your home.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {styleOptions.map((style) => {
            const active = selectedStyles.includes(style.id);
            const primary = primaryStyle === style.id;
            return (
              <div
                key={style.id}
                className={`rounded-xl border p-4 transition-colors ${
                  active ? "border-moss bg-accent/45" : "border-border bg-card"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleStyle(style.id)}
                  aria-pressed={active}
                  className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
                >
                  <span>
                    <span className="block font-semibold text-ink">{style.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{style.note}</span>
                  </span>
                  <span
                    className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-moss bg-moss text-primary-foreground" : "border-border"
                    }`}
                    aria-hidden="true"
                  >
                    {active && <Check className="size-3.5" />}
                  </span>
                </button>
                {active && (
                  <label className="mt-3 flex min-h-10 items-center gap-2 border-t border-border/70 pt-3 text-xs font-semibold text-muted-foreground">
                    <input
                      type="radio"
                      name="primary-style"
                      checked={primary}
                      onChange={() => onPrimaryChange(style.id)}
                      className="size-4 accent-[var(--moss)]"
                    />
                    {primary ? "Primary style" : "Make primary"}
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-medium text-ink">Color direction</legend>
        <p className="mt-1 text-sm text-muted-foreground">Choose a palette direction. Every swatch includes a text label and hexadecimal value.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {palettes.map((palette) => {
            const active = palette.id === paletteId;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => onPaletteChange(active ? null : palette.id)}
                aria-pressed={active}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-moss bg-accent/45" : "border-border bg-card hover:border-moss/60"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{palette.name}</span>
                  {active && <Check className="size-4 text-moss" aria-hidden="true" />}
                </span>
                <span className="mt-4 grid grid-cols-4 overflow-hidden rounded-md border border-border" aria-label={`${palette.name} palette`}>
                  {palette.colors.map((color, index) => (
                    <span
                      key={color}
                      title={`${palette.name} swatch ${index + 1}: ${color}`}
                      aria-label={`${palette.name} swatch ${index + 1}: ${color}`}
                      className="h-9"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 rounded-xl border border-border bg-sand/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg">Add a custom color</h3>
            <p className="mt-1 text-xs text-muted-foreground">Use your browser color picker to add up to six preference swatches.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3">
              <span className="sr-only">Choose custom color</span>
              <input
                type="color"
                value={pendingColor}
                onChange={(event) => setPendingColor(event.target.value)}
                className="size-8 cursor-pointer border-0 bg-transparent p-0"
                aria-label={`Custom color ${pendingColor}`}
              />
              <span className="text-xs font-medium text-muted-foreground">{pendingColor.toUpperCase()}</span>
            </label>
            <Button
              type="button"
              variant="outline"
              disabled={customColors.length >= 6 || customColors.includes(pendingColor)}
              onClick={() => onCustomColorsChange([...customColors, pendingColor])}
              className="gap-2"
            >
              <Plus className="size-4" aria-hidden="true" /> Add
            </Button>
          </div>
        </div>

        {customColors.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Custom colors">
            {customColors.map((color) => (
              <li key={color} className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-card pl-2 pr-1.5">
                <span className="size-6 rounded-full border border-border" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="text-xs font-medium text-ink">{color.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => onCustomColorsChange(customColors.filter((item) => item !== color))}
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                  aria-label={`Remove custom color ${color}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
