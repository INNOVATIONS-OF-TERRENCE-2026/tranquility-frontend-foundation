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

async function sendOwnerEmail(input: {
  eventType: string;
  entityType: string;
  entityId: string;
  subject: string;
  replyTo?: string;
  html: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const { data: delivery } = await admin.from("notification_deliveries").insert({
    event_type: input.eventType,
    entity_type: input.entityType,
    entity_id: input.entityId,
    recipient: OWNER_EMAIL,
    status: apiKey ? "pending" : "skipped",
    error_message: apiKey ? null : "RESEND_API_KEY is not configured",
  }).select("id").single();

  if (!apiKey) return { sent: false, skipped: true };

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
        subject: input.subject,
        reply_to: input.replyTo ? [input.replyTo] : undefined,
        html: input.html,
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

    return { sent: true };
  } catch (error) {
    if (delivery?.id) {
      await admin.from("notification_deliveries").update({
        status: "failed",
        error_message: error instanceof Error ? error.message.slice(0, 1000) : "Unknown email error",
      }).eq("id", delivery.id);
    }
    console.error("owner email failed", error);
    return { sent: false };
  }
}


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
      const reference = row.id.slice(0, 8).toUpperCase();
      await sendOwnerEmail({
        eventType: "contact_inquiry_created",
        entityType: "contact_inquiries",
        entityId: row.id,
        subject: `New Tranquility inquiry · ${name} · ${reference}`,
        replyTo: email,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#252927">
            <h2 style="margin:0 0 16px">New customer inquiry</h2>
            <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
            <p><strong>Name:</strong> ${escapeHtml(name)}<br>
            <strong>Phone:</strong> ${escapeHtml(phone)}<br>
            <strong>Email:</strong> ${escapeHtml(email)}<br>
            <strong>Service:</strong> ${escapeHtml(serviceType)}<br>
            <strong>Preferred date:</strong> ${escapeHtml(preferredDate || "Not provided")}</p>
            <p><strong>Message:</strong><br>${escapeHtml(notes).replaceAll("\n","<br>")}</p>
            <p style="color:#626b67">Submitted through heytlcleaning.com</p>
          </div>`,
      });
      return json(req, { ok: true, reference });
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
      const reference = row.id.slice(0, 8).toUpperCase();
      await sendOwnerEmail({
        eventType: "career_application_created",
        entityType: "career_applications",
        entityId: row.id,
        subject: `New Tranquility career application · ${fullName} · ${reference}`,
        replyTo: email,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#252927">
            <h2 style="margin:0 0 16px">New career application</h2>
            <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
            <p><strong>Name:</strong> ${escapeHtml(fullName)}<br>
            <strong>Phone:</strong> ${escapeHtml(phone)}<br>
            <strong>Email:</strong> ${escapeHtml(email)}<br>
            <strong>City:</strong> ${escapeHtml(city)}<br>
            <strong>Reliable transportation:</strong> ${reliableTransportation ? "Yes" : "No"}</p>
            <p><strong>Experience:</strong><br>${escapeHtml(experience).replaceAll("\n","<br>")}</p>
            <p><strong>Availability:</strong><br>${escapeHtml(availability).replaceAll("\n","<br>")}</p>
            ${additionalInformation ? `<p><strong>Additional information:</strong><br>${escapeHtml(additionalInformation).replaceAll("\n","<br>")}</p>` : ""}
            <p style="color:#626b67">Submitted through heytlcleaning.com</p>
          </div>`,
      });
      return json(req, { ok: true, reference });
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

    const reference = row.id.slice(0, 8).toUpperCase();
    await sendOwnerEmail({
      eventType: "quote_request_created",
      entityType: "quote_requests",
      entityId: row.id,
      subject: `New Tranquility quote request · ${name} · ${reference}`,
      replyTo: email,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#252927">
          <h2 style="margin:0 0 16px">New custom quote request</h2>
          <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}<br>
          <strong>Phone:</strong> ${escapeHtml(phone)}<br>
          <strong>Email:</strong> ${escapeHtml(email)}<br>
          <strong>City:</strong> ${escapeHtml(city)}<br>
          <strong>Property type:</strong> ${escapeHtml(propertyType)}<br>
          <strong>Approximate size:</strong> ${escapeHtml(approximateSize || "Not provided")}<br>
          <strong>Desired timing:</strong> ${escapeHtml(desiredTiming || "Not provided")}<br>
          <strong>Contact preference:</strong> ${escapeHtml(contactPreference)}</p>
          <p><strong>Scope:</strong><br>${escapeHtml(scope).replaceAll("\n","<br>")}</p>
          ${notes ? `<p><strong>Additional notes:</strong><br>${escapeHtml(notes).replaceAll("\n","<br>")}</p>` : ""}
          <p style="color:#626b67">Submitted through heytlcleaning.com. Any selected photos upload securely after the request is created.</p>
        </div>`,
    });

    return json(req, {
      ok: true,
      id: row.id,
      reference,
      uploadToken,
    });
  } catch (error) {
    console.error("public-submissions", error);
    return json(req, { error: "Unable to process request" }, 500);
  }
});