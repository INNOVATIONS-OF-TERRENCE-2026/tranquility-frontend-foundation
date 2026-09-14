/**
 * Centralized, typed pricing configuration.
 * Base pricing assumes a standard average 1-bedroom / 1-full-bath home.
 * These values are business-approved. Do not derive or invent new ones.
 */

export type ServiceId = "standard" | "deep" | "move";
export type FrequencyId = "onetime" | "weekly" | "biweekly" | "monthly";

export interface ServiceDef {
  id: ServiceId;
  name: string;
  short: string;
  basePrice: number;
  description: string;
  includes: string[];
  route: string;
}

export const services: ServiceDef[] = [
  {
    id: "standard",
    name: "Standard Clean",
    short: "Standard",
    basePrice: 145,
    route: "/residential-cleaning",
    description:
      "Consistent upkeep for a home that already feels cared for. Surfaces, floors, kitchen, and bath are refreshed on a rhythm that suits you.",
    includes: [
      "Kitchen surfaces, exterior of appliances, sink",
      "Bathroom sink, toilet, tub or shower, mirrors",
      "Dusting of reachable surfaces and fixtures",
      "Vacuuming and mopping of floors",
      "Trash removal and tidy finish",
    ],
  },
  {
    id: "deep",
    name: "Deep Clean",
    short: "Deep",
    basePrice: 215,
    route: "/deep-cleaning",
    description:
      "A detailed reset for homes that need more attention, including build-up, edges, and the places routine cleaning tends to pass over.",
    includes: [
      "Everything in a Standard Clean, taken further",
      "Detail work on edges, corners, and reachable trim",
      "Attention to build-up in kitchen and bath",
      "Hand-detailing of reachable fixtures and surfaces",
      "Careful finishing pass room by room",
    ],
  },
  {
    id: "move",
    name: "Move-In / Move-Out Clean",
    short: "Move-In / Move-Out",
    basePrice: 235,
    route: "/move-in-move-out-cleaning",
    description:
      "An empty-home clean for transitions, whether you are handing keys over or walking into a space that should feel genuinely new.",
    includes: [
      "Whole-home detail clean for an empty or near-empty home",
      "Kitchen and bathroom detailing",
      "Dusting and wiping of reachable surfaces and fixtures",
      "Vacuuming and mopping of floors",
      "Final room-by-room finishing pass",
    ],
  },
];

export interface FrequencyDef {
  id: FrequencyId;
  name: string;
  discount: number;
  note: string;
}

export const frequencies: FrequencyDef[] = [
  { id: "onetime", name: "One-time", discount: 0, note: "No commitment" },
  { id: "weekly", name: "Weekly", discount: 0.2, note: "20% savings" },
  { id: "biweekly", name: "Bi-weekly", discount: 0.15, note: "15% savings" },
  { id: "monthly", name: "Monthly", discount: 0.1, note: "10% savings" },
];

export function getService(id: ServiceId): ServiceDef {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function getFrequency(id: FrequencyId): FrequencyDef {
  const frequency = frequencies.find((item) => item.id === id);
  if (!frequency) throw new Error(`Unknown frequency: ${id}`);
  return frequency;
}

/** Discounts apply only to the service subtotal, never to add-ons. */
export function servicePrice(service: ServiceId, frequency: FrequencyId): number {
  const base = getService(service).basePrice;
  return Math.round(base * (1 - getFrequency(frequency).discount));
}

export type AddOnGroup = "scope" | "laundry" | "detail";

export interface AddOnDef {
  id: string;
  name: string;
  group: AddOnGroup;
  price: number | Record<ServiceId, number>;
  quantity?: boolean;
  startingAt?: boolean;
  derived?: boolean;
  unit?: string;
  note?: string;
}

export const addOns: AddOnDef[] = [
  {
    id: "extra-bedroom",
    name: "Additional bedroom",
    group: "scope",
    price: { standard: 15, deep: 27, move: 37 },
    quantity: true,
    derived: true,
    unit: "bedroom",
    note: "Base price includes 1 bedroom.",
  },
  {
    id: "extra-full-bath",
    name: "Additional full bathroom",
    group: "scope",
    price: { standard: 17, deep: 29, move: 39 },
    quantity: true,
    derived: true,
    startingAt: true,
    unit: "bathroom",
    note: "Base price includes 1 full bathroom.",
  },
  {
    id: "half-bath",
    name: "Half bathroom",
    group: "scope",
    price: { standard: 13, deep: 25, move: 37 },
    quantity: true,
    derived: true,
    unit: "half bath",
  },
  {
    id: "living-room",
    name: "Additional living room",
    group: "scope",
    price: 15,
    quantity: true,
    derived: true,
    unit: "room",
  },
  {
    id: "dining-room",
    name: "Dining room",
    group: "scope",
    price: 15,
    quantity: true,
    derived: true,
    unit: "room",
  },
  {
    id: "office",
    name: "Office",
    group: "scope",
    price: 12,
    quantity: true,
    derived: true,
    unit: "room",
  },
  {
    id: "laundry-room",
    name: "Laundry / utility room",
    group: "scope",
    price: { standard: 10, deep: 17, move: 22 },
    quantity: true,
    derived: true,
    unit: "room",
  },
  {
    id: "laundry-wdf",
    name: "Laundry: wash, dry & fold",
    group: "laundry",
    price: 20,
    quantity: true,
    unit: "load",
  },
  {
    id: "laundry-fold",
    name: "Laundry: fold only",
    group: "laundry",
    price: 13,
    quantity: true,
    unit: "load",
  },
  { id: "dishes", name: "Excess dishes", group: "detail", price: 25 },
  { id: "oven", name: "Oven interior", group: "detail", price: 40 },
  { id: "fridge", name: "Refrigerator interior", group: "detail", price: 25 },
  {
    id: "hood",
    name: "Above-stove hood & vents",
    group: "detail",
    price: 45,
    startingAt: true,
  },
  { id: "cabinets", name: "Cabinet interiors", group: "detail", price: 35 },
  { id: "pet-hair", name: "Excess pet hair vacuuming", group: "detail", price: 15 },
  { id: "baseboards", name: "Baseboards", group: "detail", price: 25, startingAt: true },
  { id: "garage-patio", name: "Garage / patio", group: "detail", price: 35 },
  {
    id: "carpet-spot",
    name: "Carpet spot cleaning",
    group: "detail",
    price: 35,
    startingAt: true,
  },
];

export function addOnPrice(addOn: AddOnDef, service: ServiceId): number {
  return typeof addOn.price === "number" ? addOn.price : addOn.price[service];
}

export function getAddOn(id: string): AddOnDef {
  const addOn = addOns.find((item) => item.id === id);
  if (!addOn) throw new Error(`Unknown add-on: ${id}`);
  return addOn;
}

export const selectableAddOns = addOns.filter((addOn) => !addOn.derived);

export const BASE_BEDROOMS = 1;
export const BASE_FULL_BATHS = 1;
export const CUSTOM_REVIEW_SQFT = 3000;

export interface ScopeCounts {
  bedrooms: number;
  fullBaths: number;
  halfBaths: number;
  livingRooms: number;
  diningRooms: number;
  offices: number;
  laundryRooms: number;
}

export const defaultScope: ScopeCounts = {
  bedrooms: BASE_BEDROOMS,
  fullBaths: BASE_FULL_BATHS,
  halfBaths: 0,
  livingRooms: 0,
  diningRooms: 0,
  offices: 0,
  laundryRooms: 0,
};

export interface EstimateLine {
  id: string;
  label: string;
  qty: number;
  unitPrice: number;
  total: number;
  startingAt: boolean;
}

export interface EstimateInput {
  service: ServiceId;
  frequency: FrequencyId;
  scope: ScopeCounts;
  extras: Record<string, number>;
  sqft?: number | null;
  partialHome?: boolean;
}

export interface Estimate {
  service: ServiceDef;
  frequency: FrequencyDef;
  basePrice: number;
  discountAmount: number;
  serviceSubtotal: number;
  addOnLines: EstimateLine[];
  addOnTotal: number;
  total: number;
  hasStartingAt: boolean;
  reviewFlags: string[];
}

function line(
  addOnId: string,
  qty: number,
  service: ServiceId,
  labelOverride?: string,
): EstimateLine | null {
  if (qty <= 0) return null;
  const def = getAddOn(addOnId);
  const unitPrice = addOnPrice(def, service);
  return {
    id: def.id,
    label: labelOverride ?? def.name,
    qty,
    unitPrice,
    total: unitPrice * qty,
    startingAt: Boolean(def.startingAt),
  };
}

export function buildEstimate(input: EstimateInput): Estimate {
  const service = getService(input.service);
  const frequency = getFrequency(input.frequency);
  const basePrice = service.basePrice;
  const serviceSubtotal = servicePrice(input.service, input.frequency);
  const discountAmount = basePrice - serviceSubtotal;

  const scope = input.scope;
  const derived: (EstimateLine | null)[] = [
    line("extra-bedroom", Math.max(0, scope.bedrooms - BASE_BEDROOMS), input.service),
    line("extra-full-bath", Math.max(0, scope.fullBaths - BASE_FULL_BATHS), input.service),
    line("half-bath", scope.halfBaths, input.service),
    line("living-room", scope.livingRooms, input.service),
    line("dining-room", scope.diningRooms, input.service),
    line("office", scope.offices, input.service),
    line("laundry-room", scope.laundryRooms, input.service),
  ];

  const chosen = Object.entries(input.extras).map(([id, qty]) =>
    line(id, qty, input.service),
  );

  const addOnLines = [...derived, ...chosen].filter((item): item is EstimateLine => item !== null);
  const addOnTotal = addOnLines.reduce((sum, item) => sum + item.total, 0);

  const reviewFlags: string[] = [];
  if (input.sqft && input.sqft >= CUSTOM_REVIEW_SQFT) {
    reviewFlags.push(
      `Homes around ${CUSTOM_REVIEW_SQFT.toLocaleString()} sq ft and larger are reviewed as custom scope.`,
    );
  }
  if (input.partialHome) {
    reviewFlags.push(
      "Cleaning only part of the home is custom scope and is quoted after a short consultation.",
    );
  }
  if (addOnLines.some((item) => item.startingAt)) {
    reviewFlags.push(
      "Some selected items are priced starting at a minimum and may be adjusted after review.",
    );
  }

  return {
    service,
    frequency,
    basePrice,
    discountAmount,
    serviceSubtotal,
    addOnLines,
    addOnTotal,
    total: serviceSubtotal + addOnTotal,
    hasStartingAt: addOnLines.some((item) => item.startingAt),
    reviewFlags,
  };
}

export function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export const PRICING_DISCLOSURE =
  "Pricing shown is based on a standard average 1-bedroom, 1-full-bath home. Your final price can change based on square footage, layout, condition, customizations, unusual scope, or specialty work. Final service details are confirmed with you before any cleaning takes place.";
