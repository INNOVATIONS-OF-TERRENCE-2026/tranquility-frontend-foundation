import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { availableFrequencies, buildEstimate } from "@/config/pricing";

function newReference() {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  return `TLC-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

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

type WindowId = "morning" | "midday" | "afternoon";
const WINDOWS: WindowId[] = ["morning", "midday", "afternoon"];
const CAPACITY_PER_WINDOW = 5;

type Availability = Record<string, Record<WindowId, number>>;

function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export const getBookingAvailability = createServerFn({ method: "GET" })
  .validator((input) =>
    z.object({ startDate: dateSchema, endDate: dateSchema, service: serviceSchema }).parse(input),
  )
  .handler(async ({ data }): Promise<Availability> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [holds, paid, blocks] = await Promise.all([
      supabaseAdmin
        .from("booking_holds")
        .select("service_date, arrival_window")
        .eq("service_type", data.service)
        .gte("service_date", data.startDate)
        .lte("service_date", data.endDate)
        .in("status", ["pending", "confirmed"]),
      supabaseAdmin
        .from("bookings")
        .select("service_date, arrival_window")
        .eq("service_type", data.service)
        .gte("service_date", data.startDate)
        .lte("service_date", data.endDate)
        .eq("payment_status", "paid"),
      supabaseAdmin
        .from("availability_blocks")
        .select("start_date, end_date, arrival_window")
        .lte("start_date", data.endDate)
        .gte("end_date", data.startDate)
        .or(`service_type.is.null,service_type.eq.${data.service}`),
    ]);

    if (holds.error || paid.error || blocks.error) {
      throw new Error("Unable to load availability.");
    }

    const used = new Map<string, number>();
    for (const row of [...(holds.data ?? []), ...(paid.data ?? [])]) {
      const key = `${row.service_date}:${row.arrival_window}`;
      used.set(key, (used.get(key) ?? 0) + 1);
    }

    const today = new Date().toISOString().slice(0, 10);
    const availability: Availability = {};
    for (const date of eachDate(data.startDate, data.endDate)) {
      const day = new Date(`${date}T12:00:00Z`).getUTCDay();
      const isWeekend = day === 0 || day === 6 || date < today;
      const windows = {} as Record<WindowId, number>;
      for (const window of WINDOWS) {
        if (isWeekend) {
          windows[window] = 0;
          continue;
        }
        const blocked = (blocks.data ?? []).some(
          (block) =>
            date >= block.start_date &&
            date <= block.end_date &&
            (block.arrival_window === null || block.arrival_window === window),
        );
        if (blocked) {
          windows[window] = 0;
          continue;
        }
        const taken = used.get(`${date}:${window}`) ?? 0;
        windows[window] = Math.max(0, CAPACITY_PER_WINDOW - taken);
      }
      availability[date] = windows;
    }
    return availability;
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
      service: data.service,
      frequency: data.frequency,
      scope: data.scope,
      extras: data.extras,
      sqft: data.sqft,
      partialHome: data.partialHome,
    });

    const reference = `TLC-${randomBytes(4).toString("hex").toUpperCase()}`;
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
        ...data,
        estimate: {
          serviceSubtotal: estimate.serviceSubtotal,
          addOnTotal: estimate.addOnTotal,
          total: estimate.total,
        },
      },
    });

    if (error) {
      if (error.message.includes("full")) throw new Error("SLOT_UNAVAILABLE");
      throw new Error("Unable to save your booking request.");
    }

    return { ok: true as const, reference };
  });
