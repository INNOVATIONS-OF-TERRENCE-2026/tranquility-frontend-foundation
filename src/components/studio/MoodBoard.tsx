import { Layers3 } from "lucide-react";

import { paletteById, styleOptions } from "@/config/studio";
import type { StudioState } from "@/types/studio";

export function MoodBoard({ state }: { state: StudioState }) {
  const palette = paletteById(state.paletteId);
  const style = styleOptions.find((item) => item.id === state.primaryStyle);
  const colors = [...(palette?.colors ?? []), ...state.customColors].slice(0, 6);
  const rooms = state.rooms.filter((room) => room.included);

  return (
    <section className="mt-10 border-t border-border pt-8" aria-labelledby="mood-board-heading">
      <div className="flex items-start gap-3">
        <Layers3 className="mt-1 size-5 shrink-0 text-moss" aria-hidden="true" />
        <div>
          <p className="eyebrow">Visual preference board</p>
          <h3 id="mood-board-heading" className="mt-2 text-2xl">Room mood boards</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These boards organize the preferences you selected. They are not AI-generated interior designs and do not represent a promise of interior-design services.
          </p>
        </div>
      </div>

      {rooms.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Add and include rooms to create visual preference boards.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <article key={room.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
              <div className="studio-grid relative min-h-44 overflow-hidden bg-sand p-5">
                <div className="absolute inset-x-5 bottom-5 top-5 rounded-[1.25rem] border border-border/70 bg-card/75 shadow-soft" />
                <div className="absolute bottom-8 left-8 h-16 w-24 rounded-lg border border-border bg-stone-soft" />
                <div className="absolute bottom-8 right-9 h-24 w-16 rounded-t-full border border-border bg-accent/80" />
                <div className="absolute left-1/2 top-9 h-16 w-24 -translate-x-1/2 rounded-full bg-background/80 blur-2xl" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg">{room.label}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{style?.label ?? "Style not selected"}</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{room.priority}</span>
                </div>
                {colors.length > 0 ? (
                  <div className="mt-4 flex overflow-hidden rounded-md border border-border" aria-label={`Selected colors for ${room.label}`}>
                    {colors.map((color, index) => (
                      <span
                        key={`${room.id}-${color}-${index}`}
                        className="h-8 flex-1"
                        style={{ backgroundColor: color }}
                        title={`${color} color preference`}
                        aria-label={`${color} color preference`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Choose a palette to add color direction.</p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Cleaning focus: {room.focusAreas.length ? room.focusAreas.join(", ") : "No specific focus selected"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
