import type {
  FocusArea,
  HouseholdProfile,
  MaterialProfile,
  PaletteId,
  ProductPreference,
  RoomPriority,
  RoomType,
  StudioPalette,
  StudioRoom,
  StudioState,
  StyleId,
} from "@/types/studio";

export const studioSteps = [
  { id: "spaces", label: "Your spaces", short: "Spaces" },
  { id: "priorities", label: "Cleaning priorities", short: "Priorities" },
  { id: "style", label: "Interior profile", short: "Style" },
  { id: "surfaces", label: "Surfaces and products", short: "Surfaces" },
  { id: "household", label: "Household preferences", short: "Household" },
  { id: "blueprint", label: "Home Care Blueprint", short: "Blueprint" },
] as const;

export const roomOptions: { id: RoomType; label: string }[] = [
  { id: "living-room", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "primary-bedroom", label: "Primary Bedroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "full-bathroom", label: "Full Bathroom" },
  { id: "half-bathroom", label: "Half Bathroom" },
  { id: "dining-room", label: "Dining Room" },
  { id: "office", label: "Office" },
  { id: "laundry-room", label: "Laundry Room" },
  { id: "entryway", label: "Entryway" },
  { id: "nursery", label: "Nursery" },
  { id: "playroom", label: "Playroom" },
  { id: "guest-room", label: "Guest Room" },
  { id: "garage", label: "Garage" },
  { id: "patio", label: "Patio" },
  { id: "other", label: "Other" },
];

export const roomPriorities: { id: RoomPriority; label: string; note: string }[] = [
  { id: "maintenance", label: "Maintenance", note: "Routine upkeep" },
  { id: "standard", label: "Standard Attention", note: "Normal service focus" },
  { id: "extra", label: "Extra Attention", note: "Needs additional care" },
  { id: "highest", label: "Highest Priority", note: "Top focus area" },
];

export const focusAreas: { id: FocusArea; label: string }[] = [
  { id: "floors", label: "Floors" },
  { id: "baseboards", label: "Baseboards" },
  { id: "surfaces", label: "Surfaces" },
  { id: "dusting", label: "Dusting" },
  { id: "kitchen-buildup", label: "Kitchen buildup" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "pet-hair", label: "Pet hair" },
  { id: "high-touch", label: "High-touch surfaces" },
  { id: "appliance-exteriors", label: "Appliance exteriors" },
  { id: "organization-sensitive", label: "Organization-sensitive areas" },
  { id: "glass-mirrors", label: "Glass and mirrors" },
  { id: "hard-to-reach", label: "Hard-to-reach areas" },
];

export const styleOptions: { id: StyleId; label: string; note: string }[] = [
  { id: "organic-modern", label: "Organic Modern", note: "Warm restraint, natural texture, clean form" },
  { id: "modern-luxe", label: "Modern Luxe", note: "Polished surfaces, contrast, tailored detail" },
  { id: "contemporary", label: "Contemporary", note: "Current, edited, balanced" },
  { id: "minimal", label: "Minimal", note: "Quiet surfaces and visual breathing room" },
  { id: "transitional", label: "Transitional", note: "Classic structure with modern ease" },
  { id: "warm-neutral", label: "Warm Neutral", note: "Soft taupe, ivory, oak and linen tones" },
  { id: "moody-modern", label: "Moody Modern", note: "Deep neutrals with controlled warmth" },
  { id: "natural-earthy", label: "Natural / Earthy", note: "Grounded greens, wood and stone" },
  { id: "soft-glam", label: "Soft Glam", note: "Refined shine with calm softness" },
  { id: "cozy-layered", label: "Cozy / Layered", note: "Comfort, texture and lived-in warmth" },
];

export const palettes: StudioPalette[] = [
  { id: "warm", name: "Warm", colors: ["#F4E8D6", "#C9A57A", "#876D57", "#4C3C31"] },
  { id: "cool", name: "Cool", colors: ["#E9EEF0", "#BCC9CB", "#7C9295", "#40585C"] },
  { id: "neutral", name: "Neutral", colors: ["#F3EFE8", "#D8D0C3", "#9D9489", "#514C47"] },
  { id: "earthy", name: "Earthy", colors: ["#E7E0CE", "#A8AD8B", "#6D775C", "#56483B"] },
  { id: "moody", name: "Dark / Moody", colors: ["#B9ADA0", "#6A625C", "#393A37", "#202422"] },
  { id: "airy", name: "Bright / Airy", colors: ["#FBF9F3", "#E7E2D8", "#D9E1DA", "#AEB9B0"] },
];

export const materialOptions: Record<keyof MaterialProfile, string[]> = {
  flooring: ["Hardwood", "Engineered wood", "Laminate", "Tile", "Stone", "Vinyl", "Carpet", "Rugs", "Other"],
  countertops: ["Quartz", "Granite", "Marble", "Butcher block", "Laminate", "Concrete", "Other", "Unsure"],
  metals: ["Stainless steel", "Brass", "Chrome", "Matte black", "Bronze", "Mixed", "Other"],
  sensitiveSurfaces: [
    "Natural stone",
    "Unsealed wood",
    "Delicate finishes",
    "Antique furniture",
    "Specialty glass",
    "High-gloss surfaces",
    "Artwork nearby",
    "Other",
  ],
};

export const productPreferenceOptions: { id: ProductPreference; label: string }[] = [
  { id: "company-standard", label: "Company-standard products" },
  { id: "fragrance-sensitive", label: "Fragrance-sensitive household" },
  { id: "customer-provided", label: "Customer-provided products" },
  { id: "lower-fragrance", label: "Lower-fragrance preference" },
  { id: "non-toxic-request", label: "Non-toxic options when available or requested" },
  { id: "special-surface-products", label: "Special surface-product instructions" },
];

export const protectedItemOptions = [
  "Rooms",
  "Surfaces",
  "Objects",
  "Cabinets",
  "Drawers",
  "Documents",
  "Electronics",
  "Children's items",
  "Pet areas",
  "Artwork",
  "Collectibles",
  "Other",
];

export const defaultHousehold: HouseholdProfile = {
  pets: false,
  petTypes: "",
  shedding: "none",
  childrenPresent: false,
  workFromHome: false,
  highTraffic: false,
  shoesOff: false,
  frequentEntertaining: false,
  shortTermRental: false,
  accessibilityConsiderations: false,
  fragileObjects: false,
  plants: false,
  collections: false,
  specialtyFurnishings: false,
  notes: "",
};

export function createRoom(type: RoomType, sequence: number): StudioRoom {
  const label = roomOptions.find((option) => option.id === type)?.label ?? "Room";
  return {
    id: `${type}-${sequence}`,
    type,
    label,
    included: true,
    priority: "standard",
    focusAreas: [],
    notes: "",
  };
}

export const initialStudioState: StudioState = {
  version: 1,
  service: "standard",
  frequency: "onetime",
  squareFeet: "",
  rooms: [
    createRoom("living-room", 1),
    createRoom("primary-bedroom", 2),
    createRoom("kitchen", 3),
    createRoom("full-bathroom", 4),
  ],
  extras: {},
  selectedStyles: [],
  primaryStyle: null,
  paletteId: null,
  customColors: [],
  materials: {
    flooring: [],
    countertops: [],
    metals: [],
    sensitiveSurfaces: [],
  },
  productPreferences: [],
  productNotes: "",
  household: { ...defaultHousehold },
  protectedItems: [],
  protectedNotes: "",
  generalNotes: "",
};

export function paletteById(id: PaletteId | null) {
  return palettes.find((palette) => palette.id === id) ?? null;
}
