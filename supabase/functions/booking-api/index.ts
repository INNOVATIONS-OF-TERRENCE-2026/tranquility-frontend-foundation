import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type ServiceId = "standard" | "deep" | "move";
type FrequencyId = "onetime" | "weekly" | "biweekly" | "monthly";
type ArrivalWindow = "morning" | "midday" | "afternoon";

const allowedOrigins = [
  "https://heytlcleaning.com",
  "https://www.heytlcleaning.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const lovablePreview = /^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin);
  const allowed = allowedOrigins.includes(origin) || lovablePreview;
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://heytlcleaning.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function secretKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) return JSON.parse(raw).default as string;
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  throw new Error("Supabase secret key unavailable");
}
const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OWNER_EMAIL = "tlcllc26@gmail.com";
const FROM_EMAIL = "Tranquility Level Cleaning <notifications@heytlcleaning.com>";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendBookingEmail(input: {
  entityId: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceAddress: string;
  city: string;
  zip: string;
  service: string;
  frequency: string;
  serviceDate: string;
  arrivalWindow: string;
  total: number;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const { data: delivery } = await admin.from("notification_deliveries").insert({
    event_type: "booking_request_created",
    entity_type: "booking_holds",
    entity_id: input.entityId,
    recipient: OWNER_EMAIL,
    status: apiKey ? "pending" : "skipped",
    error_message: apiKey ? null : "RESEND_API_KEY is not configured",
  }).select("id").single();

  if (!apiKey) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [OWNER_EMAIL],
        subject: `New Tranquility booking request · ${input.customerName} · ${input.reference}`,
        reply_to: [input.customerEmail],
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#252927">
            <h2 style="margin:0 0 16px">New cleaning request</h2>
            <p><strong>Reference:</strong> ${escapeHtml(input.reference)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(input.customerName)}<br>
            <strong>Phone:</strong> ${escapeHtml(input.customerPhone)}<br>
            <strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
            <p><strong>Service:</strong> ${escapeHtml(input.service)}<br>
            <strong>Frequency:</strong> ${escapeHtml(input.frequency)}<br>
            <strong>Date:</strong> ${escapeHtml(input.serviceDate)}<br>
            <strong>Arrival window:</strong> ${escapeHtml(input.arrivalWindow)}</p>
            <p><strong>Service address:</strong><br>
            ${escapeHtml(input.serviceAddress)}<br>
            ${escapeHtml(input.city)}, TX ${escapeHtml(input.zip)}</p>
            <p><strong>Server-calculated estimate:</strong> ${input.total.toFixed(2)}</p>
            <p style="color:#626b67">Submitted through heytlcleaning.com</p>
          </div>`,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof payload?.message === "string" ? payload.message : "Resend rejected the email");
    }

    if (delivery?.id) {
      await admin.from("notification_deliveries").update({
        status: "sent",
        provider_message_id: typeof payload?.id === "string" ? payload.id : null,
        sent_at: new Date().toISOString(),
        error_message: null,
      }).eq("id", delivery.id);
    }
  } catch (error) {
    if (delivery?.id) {
      await admin.from("notification_deliveries").update({
        status: "failed",
        error_message: error instanceof Error ? error.message.slice(0, 1000) : "Unknown email error",
      }).eq("id", delivery.id);
    }
    console.error("booking owner email failed", error);
  }
}
async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function rateLimit(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  const fingerprint = await sha256(`booking:${ip}`);
  const { data, error } = await admin.rpc("consume_submission_attempt", {
    p_kind: "booking",
    p_fingerprint_hash: fingerprint,
    p_limit: 10,
    p_window: "00:15:00",
  });
  if (error) throw error;
  return Boolean(data);
}

const basePrice: Record<ServiceId, number> = { standard: 145, deep: 215, move: 235 };
const discounts: Record<FrequencyId, number> = { onetime: 0, weekly: 0.20, biweekly: 0.15, monthly: 0.10 };
const serviceSpecific: Record<string, Record<ServiceId, number>> = {
  "extra-bedroom": { standard: 15, deep: 27, move: 37 },
  "extra-full-bath": { standard: 17, deep: 29, move: 39 },
  "half-bath": { standard: 13, deep: 25, move: 37 },
  "laundry-room": { standard: 10, deep: 17, move: 22 },
};
const fixedPrices: Record<string, number> = {
  "living-room": 15,
  "dining-room": 15,
  office: 12,
  "laundry-wdf": 20,
  "laundry-fold": 13,
  dishes: 25,
  oven: 40,
  fridge: 25,
  hood: 45,
  cabinets: 35,
  "pet-hair": 15,
  baseboards: 25,
  "garage-patio": 35,
  "carpet-spot": 35,
};
const selectable = new Set(["laundry-wdf","laundry-fold","dishes","oven","fridge","hood","cabinets","pet-hair","baseboards","garage-patio","carpet-spot"]);
function addonPrice(id: string, service: ServiceId) {
  if (serviceSpecific[id]) return serviceSpecific[id]![service];
  const value = fixedPrices[id];
  if (typeof value !== "number") throw new Error("Invalid add-on");
  return value;
}
function int(value: unknown, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) throw new Error("Invalid quantity");
  return Number(value);
}
function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}
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
function computeEstimate(data: any) {
  const service = data.service as ServiceId;
  const requestedFrequency = data.frequency as FrequencyId;
  if (!["standard","deep","move"].includes(service)) throw new Error("Invalid service");
  if (!["onetime","weekly","biweekly","monthly"].includes(requestedFrequency)) throw new Error("Invalid frequency");
  if (service !== "standard" && requestedFrequency !== "onetime") throw new Error("Invalid frequency");
  const frequency = service === "standard" ? requestedFrequency : "onetime";
  const serviceSubtotal = Math.round(basePrice[service] * (1 - discounts[frequency]));

  const scope = data.scope ?? {};
  const bedrooms = int(scope.bedrooms, 1, 20);
  const fullBaths = int(scope.fullBaths, 1, 20);
  const halfBaths = int(scope.halfBaths ?? 0, 0, 20);
  const livingRooms = int(scope.livingRooms ?? 0, 0, 20);
  const diningRooms = int(scope.diningRooms ?? 0, 0, 20);
  const offices = int(scope.offices ?? 0, 0, 20);
  const laundryRooms = int(scope.laundryRooms ?? 0, 0, 20);

  let addOnTotal = 0;
  addOnTotal += Math.max(0, bedrooms - 1) * addonPrice("extra-bedroom", service);
  addOnTotal += Math.max(0, fullBaths - 1) * addonPrice("extra-full-bath", service);
  addOnTotal += halfBaths * addonPrice("half-bath", service);
  addOnTotal += livingRooms * addonPrice("living-room", service);
  addOnTotal += diningRooms * addonPrice("dining-room", service);
  addOnTotal += offices * addonPrice("office", service);
  addOnTotal += laundryRooms * addonPrice("laundry-room", service);

  const extras = data.extras && typeof data.extras === "object" ? data.extras : {};
  for (const [id, rawQty] of Object.entries(extras)) {
    if (!selectable.has(id)) throw new Error("Invalid add-on");
    const qty = int(rawQty, 0, 10);
    addOnTotal += qty * addonPrice(id, service);
  }
  return {
    serviceSubtotal,
    addOnTotal,
    total: serviceSubtotal + addOnTotal,
    frequency,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "availability") {
      const service = body.service as ServiceId;
      const startDate = clean(body.startDate, 10);
      const endDate = clean(body.endDate, 10);
      if (!["standard","deep","move"].includes(service) || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return json(req, { error: "Invalid availability request" }, 400);
      }
      const dates = dateRange(startDate, endDate);
      if (!dates.length) return json(req, { error: "Invalid date range" }, 400);

      const [holds, bookings, blocks] = await Promise.all([
        admin.from("booking_holds").select("service_date, arrival_window")
          .eq("service_type", service).in("status", ["pending","confirmed"])
          .gte("service_date", startDate).lte("service_date", endDate),
        admin.from("bookings").select("service_date, arrival_window")
          .eq("service_type", service).eq("payment_status", "paid")
          .gte("service_date", startDate).lte("service_date", endDate),
        admin.from("availability_blocks").select("start_date, end_date, service_type, arrival_window")
          .lte("start_date", endDate).gte("end_date", startDate)
          .or(`service_type.is.null,service_type.eq.${service}`),
      ]);
      if (holds.error || bookings.error || blocks.error) throw holds.error ?? bookings.error ?? blocks.error;

      const result: Record<string, Record<ArrivalWindow, number>> = {};
      for (const date of dates) {
        result[date] = { morning: 5, midday: 5, afternoon: 5 };
        const day = new Date(`${date}T12:00:00Z`).getUTCDay();
        if (day === 0 || day === 6) result[date] = { morning: 0, midday: 0, afternoon: 0 };
      }
      for (const row of [...(holds.data ?? []), ...(bookings.data ?? [])]) {
        const day = result[row.service_date];
        const window = row.arrival_window as ArrivalWindow;
        if (day && window in day) day[window] = Math.max(0, day[window] - 1);
      }
      for (const block of blocks.data ?? []) {
        for (const date of dateRange(block.start_date, block.end_date)) {
          const day = result[date];
          if (!day) continue;
          if (block.arrival_window) day[block.arrival_window as ArrivalWindow] = 0;
          else result[date] = { morning: 0, midday: 0, afternoon: 0 };
        }
      }
      return json(req, { ok: true, availability: result });
    }

    if (action !== "create") return json(req, { error: "Invalid action" }, 400);
    if (clean(body?.data?.website, 10) !== "") return json(req, { ok: true, reference: "RECEIVED" });
    if (!(await rateLimit(req))) return json(req, { error: "Too many requests. Please wait and try again." }, 429);

    const data = body.data ?? {};
    const estimate = computeEstimate(data);
    const serviceDate = clean(data.serviceDate, 10);
    const arrivalWindow = clean(data.arrivalWindow, 20) as ArrivalWindow;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || !["morning","midday","afternoon"].includes(arrivalWindow)) {
      return json(req, { error: "Invalid schedule" }, 400);
    }
    const date = new Date(`${serviceDate}T12:00:00Z`);
    if ([0,6].includes(date.getUTCDay()) || serviceDate < new Date().toISOString().slice(0,10)) {
      return json(req, { error: "Selected date is unavailable" }, 400);
    }

    const customer = data.customer ?? {};
    const customerName = clean(customer.name, 100);
    const customerEmail = clean(customer.email, 255).toLowerCase();
    const customerPhone = clean(customer.phone, 30);
    const serviceAddress = clean(customer.address, 240);
    const city = clean(customer.city, 100);
    const zip = clean(customer.zip, 5);
    if (customerName.length < 2 || !validEmail(customerEmail) || !validPhone(customerPhone) || serviceAddress.length < 4 || city.length < 2 || !/^\d{5}$/.test(zip)) {
      return json(req, { error: "Invalid customer details" }, 400);
    }

    const reference = `TLC-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    const payload = {
      scope: data.scope,
      extras: data.extras ?? {},
      sqft: typeof data.sqft === "number" ? data.sqft : null,
      partialHome: Boolean(data.partialHome),
      pets: data.pets === "yes" ? "yes" : "no",
      petDetails: clean(data.petDetails, 500),
      otherSpaces: clean(data.otherSpaces, 500),
      notes: clean(data.notes, 1200),
      language: data.language === "es" ? "es" : "en",
      serverEstimate: estimate,
    };

    const { data: holdId, error } = await admin.rpc("create_booking_request", {
      p_booking_reference: reference,
      p_service_type: data.service,
      p_frequency: estimate.frequency,
      p_service_date: serviceDate,
      p_arrival_window: arrivalWindow,
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone,
      p_service_address: serviceAddress,
      p_city: city,
      p_zip: zip,
      p_estimate_cents: Math.round(estimate.total * 100),
      p_request_payload: payload,
    });
    if (error) {
      if (/full|blocked|unavailable/i.test(error.message)) return json(req, { error: "SLOT_UNAVAILABLE" }, 409);
      throw error;
    }

    if (holdId) {
      await sendBookingEmail({
        entityId: holdId,
        reference,
        customerName,
        customerEmail,
        customerPhone,
        serviceAddress,
        city,
        zip,
        service: data.service,
        frequency: estimate.frequency,
        serviceDate,
        arrivalWindow,
        total: estimate.total,
      });
    }

    return json(req, { ok: true, reference, estimate });
  } catch (error) {
    console.error("booking-api", error);
    const message = error instanceof Error ? error.message : "";
    if (
      ["Invalid service", "Invalid frequency", "Invalid quantity", "Invalid add-on"].includes(message)
    ) {
      return json(req, { error: message }, 400);
    }
    return json(req, { error: "Unable to process booking request" }, 500);
  }
});