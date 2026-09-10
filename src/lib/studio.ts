import {
  CUSTOM_REVIEW_SQFT,
  buildEstimate,
  type Estimate,
  type ScopeCounts,
} from "@/config/pricing";
import { paletteById, styleOptions } from "@/config/studio";
import type { StudioBookingDraft, StudioRoom, StudioState } from "@/types/studio";

const bedroomTypes = new Set(["bedroom", "primary-bedroom", "guest-room", "nursery"]);

function countRooms(rooms: StudioRoom[], type: StudioRoom["type"]): number {
  return rooms.filter((room) => room.included && room.type === type).length;
}

export function scopeFromRooms(rooms: StudioRoom[]): ScopeCounts {
  const included = rooms.filter((room) => room.included);
  const bedroomCount = included.filter((room) => bedroomTypes.has(room.type)).length;
  const fullBathCount = countRooms(rooms, "full-bathroom");
  const livingRoomCount = countRooms(rooms, "living-room");

  return {
    bedrooms: Math.max(1, bedroomCount),
    fullBaths: Math.max(1, fullBathCount),
    halfBaths: countRooms(rooms, "half-bathroom"),
    livingRooms: Math.max(0, livingRoomCount - 1),
    diningRooms: countRooms(rooms, "dining-room"),
    offices: countRooms(rooms, "office"),
    laundryRooms: countRooms(rooms, "laundry-room"),
  };
}

export function studioNeedsPartialReview(state: StudioState): boolean {
  const included = state.rooms.filter((room) => room.included);
  const excluded = state.rooms.filter((room) => !room.included);
  const includedBedrooms = included.filter((room) => bedroomTypes.has(room.type)).length;
  const includedFullBaths = included.filter((room) => room.type === "full-bathroom").length;
  return excluded.length > 0 || includedBedrooms === 0 || includedFullBaths === 0;
}

export function buildStudioEstimate(state: StudioState): Estimate {
  const squareFeet = state.squareFeet.trim() ? Number(state.squareFeet) : null;
  return buildEstimate({
    service: state.service,
    frequency: state.frequency,
    scope: scopeFromRooms(state.rooms),
    extras: state.extras,
    sqft: Number.isFinite(squareFeet) ? squareFeet : null,
    partialHome: studioNeedsPartialReview(state),
  });
}

export function studioReviewFlags(state: StudioState): string[] {
  const flags: string[] = [];
  const squareFeet = Number(state.squareFeet);

  if (state.squareFeet && Number.isFinite(squareFeet) && squareFeet >= CUSTOM_REVIEW_SQFT) {
    flags.push(`${CUSTOM_REVIEW_SQFT.toLocaleString()}+ sq ft property`);
  }
  if (studioNeedsPartialReview(state)) flags.push("Partial-home or atypical room scope");
  if (state.materials.sensitiveSurfaces.length > 0) flags.push("Sensitive or specialty surfaces identified");
  if (state.materials.countertops.includes("Unsure")) flags.push("Countertop material needs confirmation");
  if (state.household.fragileObjects || state.household.collections || state.household.specialtyFurnishings) {
    flags.push("Fragile, collectible, or specialty furnishings noted");
  }
  if (state.rooms.some((room) => room.type === "other" && room.included)) flags.push("Custom room type included");
  if (state.rooms.some((room) => room.priority === "highest")) flags.push("Highest-priority cleaning areas selected");
  if (state.generalNotes.trim().length > 500 || state.protectedNotes.trim().length > 500) {
    flags.push("Detailed custom instructions need review");
  }

  return [...new Set(flags)];
}

export function studioBookingDraft(state: StudioState): StudioBookingDraft {
  return {
    service: state.service,
    frequency: state.frequency,
    scope: scopeFromRooms(state.rooms),
    extras: { ...state.extras },
    squareFeet: state.squareFeet,
    partialHome: studioNeedsPartialReview(state),
  };
}

export function preferenceCompletion(state: StudioState): number {
  const checks = [
    state.rooms.length > 0,
    state.rooms.some((room) => room.focusAreas.length > 0),
    state.selectedStyles.length > 0,
    Boolean(state.paletteId || state.customColors.length),
    Object.values(state.materials).some((items) => items.length > 0),
    state.productPreferences.length > 0,
    state.household.pets ||
      state.household.childrenPresent ||
      state.household.workFromHome ||
      state.household.highTraffic ||
      state.household.shoesOff ||
      state.household.frequentEntertaining ||
      state.household.shortTermRental ||
      state.household.accessibilityConsiderations ||
      state.household.fragileObjects ||
      state.household.plants ||
      state.household.collections ||
      state.household.specialtyFurnishings,
    state.protectedItems.length > 0 || Boolean(state.protectedNotes.trim()),
    Boolean(state.generalNotes.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function blueprintText(state: StudioState): string {
  const estimate = buildStudioEstimate(state);
  const review = studioReviewFlags(state);
  const palette = paletteById(state.paletteId);
  const primaryStyle = styleOptions.find((style) => style.id === state.primaryStyle)?.label ?? "Not selected";
  const roomLines = state.rooms.map((room) => {
    const status = room.included ? "Included" : "Excluded";
    const focus = room.focusAreas.length ? room.focusAreas.join(", ") : "No focus selected";
    return `${room.label}: ${status}; ${room.priority}; focus: ${focus}${room.notes ? `; notes: ${room.notes}` : ""}`;
  });

  return [
    "TRANQUILITY HOME CARE BLUEPRINT",
    "",
    `Service: ${estimate.service.name}`,
    `Frequency: ${estimate.frequency.name} (${estimate.frequency.note})`,
    `Estimated total: $${estimate.total.toLocaleString("en-US")}`,
    `Square footage: ${state.squareFeet || "Not provided"}`,
    "",
    "ROOM PLAN",
    ...roomLines,
    "",
    "AESTHETIC PROFILE",
    `Primary style: ${primaryStyle}`,
    `Other selected styles: ${state.selectedStyles.filter((id) => id !== state.primaryStyle).map((id) => styleOptions.find((style) => style.id === id)?.label ?? id).join(", ") || "None"}`,
    `Palette: ${palette?.name ?? "Not selected"}`,
    `Colors: ${[...(palette?.colors ?? []), ...state.customColors].join(", ") || "None"}`,
    "",
    "MATERIALS",
    `Flooring: ${state.materials.flooring.join(", ") || "Not specified"}`,
    `Countertops: ${state.materials.countertops.join(", ") || "Not specified"}`,
    `Metals: ${state.materials.metals.join(", ") || "Not specified"}`,
    `Sensitive surfaces: ${state.materials.sensitiveSurfaces.join(", ") || "None noted"}`,
    "",
    "PRODUCT PREFERENCES",
    state.productPreferences.join(", ") || "None selected",
    state.productNotes || "No additional product notes",
    "",
    "PLEASE LEAVE THESE AREAS ALONE",
    state.protectedItems.join(", ") || "None selected",
    state.protectedNotes || "No additional protected-area notes",
    "",
    "GENERAL NOTES",
    state.generalNotes || "None",
    "",
    "ITEMS REQUIRING REVIEW",
    ...(review.length ? review.map((item) => `- ${item}`) : ["None identified by the current configuration"]),
    "",
    "This blueprint is a planning summary generated in your browser. It is not stored on the website.",
  ].join("\n");
}
