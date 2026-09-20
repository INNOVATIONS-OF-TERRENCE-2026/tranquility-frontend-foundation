import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
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

async function rateLimit(req: Request, kind: "contact" | "career" | "quote") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  const fingerprint = await sha256(`${kind}:${ip}`);
  const { data, error } = await admin.rpc("consume_submission_attempt", {
    p_kind: kind,
    p_fingerprint_hash: fingerprint,
    p_limit: 6,
    p_window: "00:15:00",
  });
  if (error) throw error;
  return Boolean(data);
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const kind = body?.kind;
    const data = body?.data ?? {};

    if (!["contact", "career", "quote"].includes(kind)) {
      return json(req, { error: "Invalid submission type" }, 400);
    }

    if (clean(data.website, 10) !== "") {
      return json(req, { ok: true, reference: "RECEIVED" }, 200);
    }

    if (!(await rateLimit(req, kind))) {
      return json(req, { error: "Too many requests. Please wait and try again." }, 429);
    }

    if (kind === "contact") {
      const name = clean(data.name, 100);
      const phone = clean(data.phone, 30);
      const email = clean(data.email, 255).toLowerCase();
      const serviceType = clean(data.serviceType, 30);
      const preferredDate = clean(data.preferredDate, 10) || null;
      const notes = clean(data.notes, 1200);
      const language = data.language === "es" ? "es" : "en";

      if (name.length < 2 || !validPhone(phone) || !validEmail(email) || notes.length < 10) {
        return json(req, { error: "Invalid contact submission" }, 400);
      }
      if (!["standard","deep","move","commercial","quote","other"].includes(serviceType)) {
        return json(req, { error: "Invalid service type" }, 400);
      }

      const { data: row, error } = await admin.from("contact_inquiries").insert({
        name, phone, email, service_type: serviceType, preferred_date: preferredDate,
        notes, language,
      }).select("id").single();
      if (error) throw error;
      return json(req, { ok: true, reference: row.id.slice(0, 8).toUpperCase() });
    }

    if (kind === "career") {
      const fullName = clean(data.fullName, 100);
      const email = clean(data.email, 255).toLowerCase();
      const phone = clean(data.phone, 30);
      const city = clean(data.city, 200);
      const experience = clean(data.experience, 1200);
      const availability = clean(data.availability, 1200);
      const additionalInformation = clean(data.additionalInformation, 1200) || null;
      const reliableTransportation = Boolean(data.reliableTransportation);
      const language = data.language === "es" ? "es" : "en";

      if (fullName.length < 2 || !validEmail(email) || !validPhone(phone) || city.length < 2 || experience.length < 10 || availability.length < 3) {
        return json(req, { error: "Invalid career submission" }, 400);
      }

      const { data: row, error } = await admin.from("career_applications").insert({
        full_name: fullName, email, phone, city, reliable_transportation: reliableTransportation,
        experience, availability, additional_information: additionalInformation, language,
      }).select("id").single();
      if (error) throw error;
      return json(req, { ok: true, reference: row.id.slice(0, 8).toUpperCase() });
    }

    const propertyType = clean(data.propertyType, 30);
    const name = clean(data.name, 100);
    const email = clean(data.email, 255).toLowerCase();
    const phone = clean(data.phone, 30);
    const city = clean(data.city, 200);
    const approximateSize = clean(data.approximateSize, 200) || null;
    const scope = clean(data.scope, 1200);
    const desiredTiming = clean(data.desiredTiming, 200) || null;
    const contactPreference = clean(data.contactPreference, 30);
    const notes = clean(data.notes, 1200) || null;
    const language = data.language === "es" ? "es" : "en";

    if (!["residential","commercial","specialty"].includes(propertyType) || name.length < 2 || !validEmail(email) || !validPhone(phone) || city.length < 2 || scope.length < 10) {
      return json(req, { error: "Invalid quote submission" }, 400);
    }
    if (!["phone","email","text","video"].includes(contactPreference)) {
      return json(req, { error: "Invalid contact preference" }, 400);
    }

    const uploadToken = randomToken();
    const tokenHashHex = await sha256(uploadToken);

    const { data: row, error } = await admin.from("quote_requests").insert({
      property_type: propertyType, name, email, phone, city,
      approximate_size: approximateSize, scope, desired_timing: desiredTiming,
      contact_preference: contactPreference, notes, language,
      upload_token_hash: "\\x" + tokenHashHex,
      upload_token_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }).select("id").single();
    if (error) throw error;

    return json(req, {
      ok: true,
      id: row.id,
      reference: row.id.slice(0, 8).toUpperCase(),
      uploadToken,
    });
  } catch (error) {
    console.error("public-submissions", error);
    return json(req, { error: "Unable to process request" }, 500);
  }
});