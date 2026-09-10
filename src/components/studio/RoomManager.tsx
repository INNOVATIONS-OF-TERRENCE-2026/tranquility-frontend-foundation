import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { focusAreas, roomOptions, roomPriorities } from "@/config/studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FocusArea, RoomType, StudioRoom } from "@/types/studio";

export function RoomManager({
  rooms,
  onAdd,
  onUpdate,
  onRemove,
}: {
  rooms: StudioRoom[];
  onAdd: (type: RoomType) => void;
  onUpdate: (id: string, patch: Partial<StudioRoom>) => void;
  onRemove: (id: string) => void;
}) {
  const [nextType, setNextType] = useState<RoomType>("bedroom");

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Room planning</p>
          <h2 className="mt-2 text-3xl">Build the rooms that matter</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Include the spaces you want cleaned, leave out the ones you do not, and add room-specific priorities. Room counts connect to the existing approved pricing model where applicable.
          </p>
        </div>
        <div className="flex min-w-0 gap-2">
          <label className="min-w-0 flex-1 sm:w-48 sm:flex-none">
            <span className="sr-only">Room type to add</span>
            <select
              value={nextType}
              onChange={(event) => setNextType(event.target.value as RoomType)}
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-ink"
            >
              {roomOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" onClick={() => onAdd(nextType)} className="gap-2">
            <Plus className="size-4" aria-hidden="true" /> Add room
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-8 border-y border-border py-12 text-center">
          <h3 className="text-xl">No spaces configured yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add a room above to begin your Home Care Blueprint.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({
  room,
  onUpdate,
  onRemove,
}: {
  room: StudioRoom;
  onUpdate: (id: string, patch: Partial<StudioRoom>) => void;
  onRemove: (id: string) => void;
}) {
  const inputId = useId();
  const priorityId = useId();

  useEffect(() => {
    const url = room.photoUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [room.photoUrl]);

  function toggleFocus(focus: FocusArea) {
    const next = room.focusAreas.includes(focus)
      ? room.focusAreas.filter((item) => item !== focus)
      : [...room.focusAreas, focus];
    onUpdate(room.id, { focusAreas: next });
  }

  function choosePhoto(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    onUpdate(room.id, {
      photoUrl: URL.createObjectURL(file),
      photoName: file.name,
    });
  }

  function removePhoto() {
    if (room.photoUrl) URL.revokeObjectURL(room.photoUrl);
    onUpdate(room.id, { photoUrl: undefined, photoName: undefined });
  }

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-card shadow-soft ${
        room.included ? "border-border" : "border-dashed border-border/80 opacity-80"
      }`}
    >
      {room.photoUrl ? (
        <div className="relative aspect-[16/8] overflow-hidden border-b border-border bg-muted">
          <img src={room.photoUrl} alt={`Local preview for ${room.label}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/95 text-ink shadow-soft"
            aria-label={`Remove local photo for ${room.label}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="studio-grid flex min-h-28 items-center justify-center border-b border-border bg-sand/70 px-5 text-center">
          <div>
            <ImagePlus className="mx-auto size-5 text-moss" aria-hidden="true" />
            <p className="mt-2 text-xs text-muted-foreground">Optional local room preview</p>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Label htmlFor={`${inputId}-label`}>Room name</Label>
            <Input
              id={`${inputId}-label`}
              value={room.label}
              maxLength={60}
              onChange={(event) => onUpdate(room.id, { label: event.target.value })}
              className="mt-2"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(room.id)}
            className="mt-7 inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            aria-label={`Remove ${room.label}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-border bg-sand/50 px-3 text-sm">
          <input
            type="checkbox"
            checked={room.included}
            onChange={(event) => onUpdate(room.id, { included: event.target.checked })}
            className="size-4 accent-[var(--moss)]"
          />
          <span>
            <span className="font-semibold text-ink">Include in cleaning</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {room.included ? "Included" : "Excluded"}
            </span>
          </span>
        </label>

        <div className="mt-4">
          <Label htmlFor={priorityId}>Cleaning priority</Label>
          <select
            id={priorityId}
            value={room.priority}
            onChange={(event) => onUpdate(room.id, { priority: event.target.value as StudioRoom["priority"] })}
            className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-ink"
          >
            {roomPriorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.label}: {priority.note}
              </option>
            ))}
          </select>
          {(room.priority === "extra" || room.priority === "highest") && (
            <p className="mt-1.5 text-xs text-oak">May require custom review depending on the work involved.</p>
          )}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-ink">Focus areas</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {focusAreas.map((focus) => {
              const active = room.focusAreas.includes(focus.id);
              return (
                <button
                  key={focus.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFocus(focus.id)}
                  className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "border-moss bg-accent text-accent-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-moss/60"
                  }`}
                >
                  {focus.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <Label htmlFor={`${inputId}-notes`}>Room notes</Label>
          <Textarea
            id={`${inputId}-notes`}
            value={room.notes}
            maxLength={500}
            onChange={(event) => onUpdate(room.id, { notes: event.target.value })}
            placeholder="Delicate objects, areas to skip, organization preferences, or other context"
            className="mt-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-ink">
            <ImagePlus className="size-4 text-moss" aria-hidden="true" />
            {room.photoUrl ? "Replace photo" : "Choose room photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                choosePhoto(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {room.photoName && <span className="max-w-full truncate text-xs text-muted-foreground">{room.photoName}</span>}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Photos remain on this device in the current website version and are not uploaded automatically. Do not select IDs, financial documents, medical records, confidential paperwork, or other sensitive information.
        </p>
      </div>
    </article>
  );
}
