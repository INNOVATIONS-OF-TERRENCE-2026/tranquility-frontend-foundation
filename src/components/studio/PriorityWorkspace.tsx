import { Check } from "lucide-react";

import { focusAreas, roomPriorities } from "@/config/studio";
import type { FocusArea, RoomPriority, StudioRoom } from "@/types/studio";

export function PriorityWorkspace({
  rooms,
  onUpdate,
}: {
  rooms: StudioRoom[];
  onUpdate: (id: string, patch: Partial<StudioRoom>) => void;
}) {
  const included = rooms.filter((room) => room.included);

  function toggleFocus(room: StudioRoom, focus: FocusArea) {
    onUpdate(room.id, {
      focusAreas: room.focusAreas.includes(focus)
        ? room.focusAreas.filter((item) => item !== focus)
        : [...room.focusAreas, focus],
    });
  }

  return (
    <div>
      <p className="eyebrow">Cleaning priorities</p>
      <h2 className="mt-2 text-3xl">Tell us where attention matters most</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Priority levels organize your preferences. They do not automatically change price. Higher-complexity selections may be flagged for review before service.
      </p>

      {included.length === 0 ? (
        <div className="mt-8 border-y border-border py-12 text-center">
          <h3 className="text-xl">No included rooms yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Return to Your Spaces and include at least one room.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {included.map((room) => (
            <section key={room.id} className="rounded-xl border border-border bg-card p-5 shadow-soft" aria-labelledby={`priority-${room.id}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 id={`priority-${room.id}`} className="text-xl">{room.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Choose the service attention level and focus areas for this room.</p>
                </div>
                <select
                  value={room.priority}
                  onChange={(event) => onUpdate(room.id, { priority: event.target.value as RoomPriority })}
                  aria-label={`Cleaning priority for ${room.label}`}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm text-ink"
                >
                  {roomPriorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {focusAreas.map((focus) => {
                  const active = room.focusAreas.includes(focus.id);
                  return (
                    <button
                      key={focus.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleFocus(room, focus.id)}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-moss bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-moss/60"
                      }`}
                    >
                      {active && <Check className="size-3" aria-hidden="true" />}
                      {focus.label}
                    </button>
                  );
                })}
              </div>

              {(room.priority === "extra" || room.priority === "highest") && (
                <p className="mt-4 text-xs font-medium text-oak">May require custom review depending on the work involved.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
