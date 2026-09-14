import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  availableFrequencies,
  buildEstimate,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";

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

function dateRange(start: string, end: string) {
  const values: string[] = [];
  const current = new Date(`${start}T12:00:00Z`);
  const finish = new Date(`${end}T12:00:00Z`);
  while (current <= finish && values.length < 62) {
    values.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return values;
}

export const getBookingAvailability = createServerFn({ method: "GET" })
  .validator((input) =>
    z.object({ startDate: dateSchema, endDate: dateSchema, service: serviceSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [holds, bookings, blocks] = await Promise.all([
      supabaseAdmin
        .from("booking_holds")
        .select("service_date, arrival_window")
        .eq("service_type", data.service)
        .in("status", ["pending", "confirmed"])
        .gte("service_date", data.startDate)
        .lte("service_date", data.endDate),
      supabaseAdmin
        .from("bookings")
        .select("service_date, arrival_window")
        .eq("service_type", data.service)
        .eq("payment_status", "paid")
        .gte("service_date", data.startDate)
        .lte("service_date", data.endDate),
      supabaseAdmin
        .from("availability_blocks")
        .select("start_date, end_date, service_type, arrival_window")
        .lte("start_date", data.endDate)
        .gte("end_date", data.startDate)
        .or(`service_type.is.null,service_type.eq.${data.service}`),
    ]);
    if (holds.error || bookings.error || blocks.error)
      throw new Error("Unable to check availability.");

    const result: Record<string, Record<"morning" | "midday" | "afternoon", number>> = {};
    for (const date of dateRange(data.startDate, data.endDate)) {
      result[date] = { morning: 5, midday: 5, afternoon: 5 };
      const day = new Date(`${date}T12:00:00Z`).getUTCDay();
      if (day === 0 || day === 6) result[date] = { morning: 0, midday: 0, afternoon: 0 };
    }
    for (const row of [...(holds.data ?? []), ...(bookings.data ?? [])]) {
      const window = row.arrival_window as "morning" | "midday" | "afternoon";
      const date = result[row.service_date];
      if (date && window in date) date[window] = Math.max(0, date[window] - 1);
    }
    for (const block of blocks.data ?? []) {
      for (const date of dateRange(block.start_date, block.end_date)) {
        const day = result[date];
        if (!day) continue;
        if (block.arrival_window) day[block.arrival_window as keyof typeof day] = 0;
        else result[date] = { morning: 0, midday: 0, afternoon: 0 };
      }
    }
    return result;
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
    const estimate = buildEstimate({
      service: data.service as ServiceId,
      frequency: data.frequency as FrequencyId,
      scope: data.scope,
      extras: data.extras,
      sqft: data.sqft,
      partialHome: data.partialHome,
    });
    const reference = `TLC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("create_booking_request", {
      p_booking_reference: reference,
      p_service_type: data.service,
      p_frequency: data.frequency,
      p_service_date: data.serviceDate,
      p_arrival_window: data.arrivalWindow,
      p_customer_name: data.customer.name,
      p_customer_email: data.customer.email,
      p_customer_phone: data.customer.phone,
      p_service_address: data.customer.address,
      p_city: data.customer.city,
      p_zip: data.customer.zip,
      p_estimate_cents: Math.round(estimate.total * 100),
      p_request_payload: {
        scope: data.scope,
        extras: data.extras,
        sqft: data.sqft,
        partialHome: data.partialHome,
        pets: data.pets,
        petDetails: data.petDetails,
        otherSpaces: data.otherSpaces,
        notes: data.notes,
        language: data.language,
      },
    });
    if (error) {
      if (/full|blocked|unavailable/i.test(error.message)) throw new Error("SLOT_UNAVAILABLE");
      throw new Error("Unable to save the booking request.");
    }
    return { ok: true as const, reference };
  });
