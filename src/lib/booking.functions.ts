import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { invokePublicEdge } from "@/integrations/supabase/public-api";
import { availableFrequencies } from "@/config/pricing";

const serviceSchema = z.enum(["standard", "deep", "move"]);
const frequencySchema = z.enum(["onetime", "weekly", "biweekly", "monthly"]);
const dateSchema = z.string().date();
const windowSchema = z.enum(["morning", "midday", "afternoon"]);
const scopeSchema = z.object({
  bedrooms: z.number().int().min(1).max(20),
  fullBaths: z.number().int().min(1).max(20),
  halfBaths: z.number().int().min(0).max(20),
  livingRooms: z.number().int().min(0).max(20),
  diningRooms: z.number().int().min(0).max(20),
  offices: z.number().int().min(0).max(20),
  laundryRooms: z.number().int().min(0).max(20),
});

const requestSchema = z.object({
  service: serviceSchema,
  frequency: frequencySchema,
  serviceDate: dateSchema,
  arrivalWindow: windowSchema,
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(10).max(30),
    address: z.string().trim().min(4).max(240),
    city: z.string().trim().min(2).max(100),
    zip: z.string().regex(/^\d{5}$/),
  }),
  scope: scopeSchema,
  extras: z.record(z.string(), z.number().int().min(0).max(10)),
  sqft: z.number().positive().max(100000).nullable(),
  partialHome: z.boolean(),
  pets: z.enum(["yes", "no"]),
  petDetails: z.string().trim().max(500),
  otherSpaces: z.string().trim().max(500),
  notes: z.string().trim().max(1200),
  language: z.enum(["en", "es"]),
  website: z.string().max(0),
});

type Availability = Record<
  string,
  Record<"morning" | "midday" | "afternoon", number>
>;

type AvailabilityResponse = {
  ok: true;
  availability: Availability;
};

type BookingResponse = {
  ok: true;
  reference: string;
  estimate: {
    serviceSubtotal: number;
    addOnTotal: number;
    total: number;
    frequency: "onetime" | "weekly" | "biweekly" | "monthly";
  };
};

export const getBookingAvailability = createServerFn({ method: "GET" })
  .validator((input) =>
    z.object({ startDate: dateSchema, endDate: dateSchema, service: serviceSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await invokePublicEdge<AvailabilityResponse>("booking-api", {
      action: "availability",
      ...data,
    });
    return result.availability;
  });

export const createBookingRequest = createServerFn({ method: "POST" })
  .validator((input) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    const approved = availableFrequencies(data.service).some((item) => item.id === data.frequency);
    if (!approved) throw new Error("This frequency is not available for the selected service.");

    const selected = new Date(`${data.serviceDate}T12:00:00Z`);
    if (
      [0, 6].includes(selected.getUTCDay()) ||
      data.serviceDate < new Date().toISOString().slice(0, 10)
    ) {
      throw new Error("Selected date is unavailable.");
    }

    try {
      return await invokePublicEdge<BookingResponse>("booking-api", {
        action: "create",
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("SLOT_UNAVAILABLE")) {
        throw new Error("SLOT_UNAVAILABLE");
      }
      throw error;
    }
  });
