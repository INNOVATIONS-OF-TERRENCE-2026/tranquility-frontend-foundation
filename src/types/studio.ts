import type { FrequencyId, ScopeCounts, ServiceId } from "@/config/pricing";

export type StudioStepId =
  | "spaces"
  | "priorities"
  | "style"
  | "surfaces"
  | "household"
  | "blueprint";

export type RoomType =
  | "living-room"
  | "bedroom"
  | "primary-bedroom"
  | "kitchen"
  | "full-bathroom"
  | "half-bathroom"
  | "dining-room"
  | "office"
  | "laundry-room"
  | "entryway"
  | "nursery"
  | "playroom"
  | "guest-room"
  | "garage"
  | "patio"
  | "other";

export type RoomPriority = "maintenance" | "standard" | "extra" | "highest";

export type FocusArea =
  | "floors"
  | "baseboards"
  | "surfaces"
  | "dusting"
  | "kitchen-buildup"
  | "bathrooms"
  | "pet-hair"
  | "high-touch"
  | "appliance-exteriors"
  | "organization-sensitive"
  | "glass-mirrors"
  | "hard-to-reach";

export interface StudioRoom {
  id: string;
  type: RoomType;
  label: string;
  included: boolean;
  priority: RoomPriority;
  focusAreas: FocusArea[];
  notes: string;
  photoUrl?: string;
  photoName?: string;
}

export type StyleId =
  | "organic-modern"
  | "modern-luxe"
  | "contemporary"
  | "minimal"
  | "transitional"
  | "warm-neutral"
  | "moody-modern"
  | "natural-earthy"
  | "soft-glam"
  | "cozy-layered";

export type PaletteId = "warm" | "cool" | "neutral" | "earthy" | "moody" | "airy";

export interface StudioPalette {
  id: PaletteId;
  name: string;
  colors: string[];
}

export interface MaterialProfile {
  flooring: string[];
  countertops: string[];
  metals: string[];
  sensitiveSurfaces: string[];
}

export interface HouseholdProfile {
  pets: boolean;
  petTypes: string;
  shedding: "none" | "low" | "moderate" | "high";
  childrenPresent: boolean;
  workFromHome: boolean;
  highTraffic: boolean;
  shoesOff: boolean;
  frequentEntertaining: boolean;
  shortTermRental: boolean;
  accessibilityConsiderations: boolean;
  fragileObjects: boolean;
  plants: boolean;
  collections: boolean;
  specialtyFurnishings: boolean;
  notes: string;
}

export type ProductPreference =
  | "company-standard"
  | "fragrance-sensitive"
  | "customer-provided"
  | "lower-fragrance"
  | "non-toxic-request"
  | "special-surface-products";

export interface StudioState {
  version: 1;
  service: ServiceId;
  frequency: FrequencyId;
  squareFeet: string;
  rooms: StudioRoom[];
  extras: Record<string, number>;
  selectedStyles: StyleId[];
  primaryStyle: StyleId | null;
  paletteId: PaletteId | null;
  customColors: string[];
  materials: MaterialProfile;
  productPreferences: ProductPreference[];
  productNotes: string;
  household: HouseholdProfile;
  protectedItems: string[];
  protectedNotes: string;
  generalNotes: string;
}

export interface StudioBookingDraft {
  service: ServiceId;
  frequency: FrequencyId;
  scope: ScopeCounts;
  extras: Record<string, number>;
  squareFeet: string;
  partialHome: boolean;
}
