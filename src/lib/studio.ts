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

export interface StudioReviewRule {
  id: string;
  label: string;
  test: (state: StudioState) => boolean;
}

export const studioReviewRules: StudioReviewRule[] = [
  {
    id: "large-property",
    label: `${CUSTOM_REVIEW_SQFT.toLocaleString()}+ sq ft property`,
    test: (state) => {
      const squareFeet = Number(state.squareFeet);
      return Boolean(
        state.squareFeet && Number.isFinite(squareFeet) && squareFeet >= CUSTOM_REVIEW_SQFT,
      );
    },
  },
  {
    id: "partial-scope",
    label: "Partial-home or atypical room scope",
    test: studioNeedsPartialReview,
  },
  {
    id: "sensitive-surfaces",
    label: "Sensitive or specialty surfaces identified",
    test: (state) => state.materials.sensitiveSurfaces.length > 0,
  },
  {
    id: "uncertain-material",
    label: "Countertop material needs confirmation",
    test: (state) => state.materials.countertops.includes("Unsure"),
  },
  {
    id: "fragile-items",
    label: "Fragile, collectible, or specialty furnishings noted",
    test: (state) =>
      state.household.fragileObjects ||
      state.household.collections ||
      state.household.specialtyFurnishings,
  },
  {
    id: "custom-room",
    label: "Custom room type included",
    test: (state) => state.rooms.some((room) => room.type === "other" && room.included),
  },
  {
    id: "highest-priority",
    label: "Highest-priority cleaning areas selected",
    test: (state) => state.rooms.some((room) => room.priority === "highest"),
  },
  {
    id: "complex-instructions",
    label: "Detailed custom instructions need review",
    test: (state) =>
      state.generalNotes.trim().length > 500 || state.protectedNotes.trim().length > 500,
  },
  {
    id: "short-term-rental",
    label: "Short-term rental context should be confirmed",
    test: (state) => state.household.shortTermRental,
  },
];

export function studioReviewFlags(state: StudioState): string[] {
  return studioReviewRules.filter((rule) => rule.test(state)).map((rule) => rule.label);
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
  const hasHouseholdContext =
    state.household.pets ||
    state.household.childrenPresent ||
    state.household.workFromHome ||
    state.household.highTraffic ||
    state.household.shoesOff ||
    state.household.frequentEntertaining ||
    state.household.shortTermRental ||
    state.household.olderAdultConsiderations ||
    state.household.accessibilityConsiderations ||
    state.household.fragileObjects ||
    state.household.plants ||
    state.household.collections ||
    state.household.specialtyFurnishings ||
    Boolean(state.household.notes.trim());

  const checks = [
    state.rooms.length > 0,
    state.rooms.some((room) => room.focusAreas.length > 0),
    state.selectedStyles.length > 0,
    Boolean(state.paletteId || state.customColors.length),
    Object.values(state.materials).some((items) => items.length > 0),
    state.productPreferences.length > 0 || Boolean(state.productNotes.trim()),
    hasHouseholdContext,
    state.protectedItems.length > 0 || Boolean(state.protectedNotes.trim()),
    Boolean(state.generalNotes.trim()),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function householdSummary(state: StudioState): string[] {
  const items: string[] = [];
  if (state.household.pets) {
    items.push(
      `Pets: ${state.household.petTypes || "present"}; shedding ${state.household.shedding}`,
    );
  }
  if (state.household.childrenPresent) items.push("Children present");
  if (state.household.workFromHome) items.push("Work-from-home household");
  if (state.household.highTraffic) items.push("High-traffic home");
  if (state.household.shoesOff) items.push("Shoes-off home");
  if (state.household.frequentEntertaining) items.push("Frequent entertaining");
  if (state.household.shortTermRental) items.push("Short-term rental context");
  if (state.household.olderAdultConsiderations) items.push("Older-adult household considerations");
  if (state.household.accessibilityConsiderations) items.push("Accessibility considerations");
  if (state.household.fragileObjects) items.push("Fragile objects");
  if (state.household.plants) items.push("Plants");
  if (state.household.collections) items.push("Collections or displays");
  if (state.household.specialtyFurnishings) items.push("Specialty furnishings");
  return items;
}

export function blueprintText(state: StudioState): string {
  const estimate = buildStudioEstimate(state);
  const review = studioReviewFlags(state);
  const palette = paletteById(state.paletteId);
  const primaryStyle =
    styleOptions.find((style) => style.id === state.primaryStyle)?.label ?? "Not selected";
  const otherStyles = state.selectedStyles
    .filter((id) => id !== state.primaryStyle)
    .map((id) => styleOptions.find((style) => style.id === id)?.label ?? id)
    .join(", ");
  const roomLines = state.rooms.map((room) => {
    const status = room.included ? "Included" : "Excluded";
    const focus = room.focusAreas.length ? room.focusAreas.join(", ") : "No focus selected";
    return `${room.label}: ${status}; ${room.priority}; focus: ${focus}${room.notes ? `; notes: ${room.notes}` : ""}`;
  });
  const household = householdSummary(state);

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
    `Other selected styles: ${otherStyles || "None"}`,
    `Palette: ${palette?.name ?? "Not selected"}`,
    `Colors: ${[...(palette?.colors ?? []), ...state.customColors].join(", ") || "None"}`,
    "",
    "MATERIALS",
    `Flooring: ${state.materials.flooring.join(", ") || "Not specified"}`,
    `Countertops: ${state.materials.countertops.join(", ") || "Not specified"}`,
    `Metals: ${state.materials.metals.join(", ") || "Not specified"}`,
    `Sensitive surfaces: ${state.materials.sensitiveSurfaces.join(", ") || "None noted"}`,
    "",
    "HOUSEHOLD OVERVIEW",
    ...(household.length ? household : ["No optional household context selected"]),
    state.household.notes || "No additional household notes",
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
    ...(review.length
      ? review.map((item) => `- ${item}`)
      : ["None identified by the current configuration"]),
    "",
    "This blueprint is a planning summary generated in your browser. It is not stored on the website.",
  ].join("\n");
}
