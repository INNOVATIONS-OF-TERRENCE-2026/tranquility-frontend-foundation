import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Language = "en" | "es";

const OWNER_EMAIL = "tlcllc26@gmail.com";
const FROM_EMAIL = "Tranquility Level Cleaning <notifications@heytlcleaning.com>";
const SOURCE_URL = "https://heytlcleaning.com/giveaway";
const CONSENT_VERSION = "giveaway-2026-10-v1";

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
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
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

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

function validPhone(value: string) {
  return normalizePhone(value).length === 10;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function chicagoDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return { year: get("year"), month: get("month"), day: get("day") };
}

function addMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function giveawayCycle(now = new Date()) {
  const current = chicagoDateParts(now);
  const target =
    current.day <= 3 ? { year: current.year, month: current.month } : addMonth(current.year, current.month);
  const month = `${target.year}-${String(target.month).padStart(2, "0")}-01`;
  const deadline = `${target.year}-${String(target.month).padStart(2, "0")}-03`;
  const rollover = current.day > 3;
  return { month, deadline, rollover };
}

async function rateLimit(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const fingerprint = await sha256(`giveaway:${ip}`);
  const { data, error } = await admin.rpc("consume_submission_attempt", {
    p_kind: "giveaway",
    p_fingerprint_hash: fingerprint,
    p_limit: 4,
    p_window: "00:15:00",
  });
  if (error) throw error;
  return { allowed: Boolean(data), ipHash: await sha256(`marketing:${ip}`) };
}

const emailConsent = {
  en: "I agree to receive occasional promotional emails from Tranquility Level Cleaning. Consent is optional and is not required to enter or purchase services. I can unsubscribe at any time.",
  es: "Acepto recibir correos promocionales ocasionales de Tranquility Level Cleaning. El consentimiento es opcional y no es necesario para participar ni comprar servicios. Puedo cancelar la suscripción en cualquier momento.",
};

const smsConsent = {
  en: "I agree to receive recurring promotional text messages from Tranquility Level Cleaning at the number provided. Consent is optional and is not required to enter or purchase services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.",
  es: "Acepto recibir mensajes de texto promocionales recurrentes de Tranquility Level Cleaning en el número proporcionado. El consentimiento es opcional y no es necesario para participar ni comprar servicios. La frecuencia de mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar o HELP para obtener ayuda.",
};

async function sendOwnerEmail(input: {
  id: string;
  month: string;
  name: string;
  email: string;
  phone: string;
  entryFor: string;
  nomineeName: string | null;
  relationship: string | null;
  city: string;
  zip: string;
  category: string;
  story: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const { data: delivery } = await admin
    .from("notification_deliveries")
    .insert({
      event_type: "giveaway_entry_created",
      entity_type: "giveaway_entries",
      entity_id: input.id,
      recipient: OWNER_EMAIL,
      status: apiKey ? "pending" : "skipped",
      error_message: apiKey ? null : "RESEND_API_KEY is not configured",
    })
    .select("id")
    .single();

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
        reply_to: [input.email],
        subject: `New monthly giveaway entry · ${input.name} · ${input.month.slice(0, 7)}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#252927">
            <h2 style="margin:0 0 16px">New monthly cleaning giveaway entry</h2>
            <p><strong>Drawing month:</strong> ${escapeHtml(input.month.slice(0, 7))}</p>
            <p><strong>Entrant:</strong> ${escapeHtml(input.name)}<br>
            <strong>Email:</strong> ${escapeHtml(input.email)}<br>
            <strong>Phone:</strong> ${escapeHtml(input.phone)}<br>
            <strong>City / ZIP:</strong> ${escapeHtml(input.city)} ${escapeHtml(input.zip)}</p>
            <p><strong>Entry for:</strong> ${escapeHtml(input.entryFor)}<br>
            <strong>Nominee:</strong> ${escapeHtml(input.nomineeName || "Self")}<br>
            <strong>Relationship:</strong> ${escapeHtml(input.relationship || "Not applicable")}<br>
            <strong>Reason category:</strong> ${escapeHtml(input.category)}</p>
            <p><strong>Why they are entering:</strong><br>${escapeHtml(input.story).replaceAll("\n", "<br>")}</p>
            <p><strong>Marketing email opt-in:</strong> ${input.emailOptIn ? "Yes" : "No"}<br>
            <strong>Marketing SMS opt-in:</strong> ${input.smsOptIn ? "Yes" : "No"}</p>
            <p style="color:#626b67">Submitted through heytlcleaning.com/giveaway</p>
          </div>`,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof payload?.message === "string" ? payload.message : "Resend rejected the email");
    }

    if (delivery?.id) {
      await admin
        .from("notification_deliveries")
        .update({
          status: "sent",
          provider_message_id: typeof payload?.id === "string" ? payload.id : null,
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", delivery.id);
    }
  } catch (error) {
    if (delivery?.id) {
      await admin
        .from("notification_deliveries")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message.slice(0, 1000) : "Unknown email error",
        })
        .eq("id", delivery.id);
    }
    console.error("giveaway owner email failed", error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "status") {
      return json(req, { ok: true, ...giveawayCycle() });
    }

    if (action !== "enter") return json(req, { error: "Invalid action" }, 400);

    const data = body?.data ?? {};
    if (clean(data.website, 10) !== "") {
      return json(req, { ok: true, reference: "RECEIVED", ...giveawayCycle() });
    }

    const limit = await rateLimit(req);
    if (!limit.allowed) {
      return json(req, { error: "Too many attempts. Please wait and try again." }, 429);
    }

    const language: Language = data.language === "es" ? "es" : "en";
    const entrantName = clean(data.entrantName, 100);
    const entrantEmail = clean(data.entrantEmail, 255).toLowerCase();
    const entrantPhoneRaw = clean(data.entrantPhone, 30);
    const entrantPhone = normalizePhone(entrantPhoneRaw);
    const entryFor = clean(data.entryFor, 30);
    const nomineeName = clean(data.nomineeName, 100) || null;
    const nomineeRelationship = clean(data.nomineeRelationship, 100) || null;
    const city = clean(data.city, 100);
    const zip = clean(data.zip, 5);
    const needCategory = clean(data.needCategory, 40);
    const story = clean(data.story, 2500);
    const emailOptIn = Boolean(data.marketingEmailOptIn);
    const smsOptIn = Boolean(data.marketingSmsOptIn);
    const age18 = data.age18 === true;

    if (
      entrantName.length < 2 ||
      !validEmail(entrantEmail) ||
      !validPhone(entrantPhoneRaw) ||
      !["self", "someone_else"].includes(entryFor) ||
      (entryFor === "someone_else" && !nomineeName) ||
      city.length < 2 ||
      !/^\d{5}$/.test(zip) ||
      !["postpartum", "mental_health_clutter", "recovery", "disability_support", "veteran_support", "other"].includes(needCategory) ||
      story.length < 20 ||
      !age18
    ) {
      return json(req, { error: "Please complete all required giveaway fields." }, 400);
    }

    const cycle = giveawayCycle();

    const { data: entry, error } = await admin
      .from("giveaway_entries")
      .insert({
        giveaway_month: cycle.month,
        entrant_name: entrantName,
        entrant_email: entrantEmail,
        entrant_phone: entrantPhone,
        entry_for: entryFor,
        nominee_name: nomineeName,
        nominee_relationship: nomineeRelationship,
        city,
        zip,
        need_category: needCategory,
        story,
        marketing_email_opt_in: emailOptIn,
        marketing_sms_opt_in: smsOptIn,
        consent_version: CONSENT_VERSION,
        language,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return json(
          req,
          {
            error: language === "es"
              ? "Ya existe una participación para este correo o teléfono en este sorteo mensual."
              : "An entry already exists for this email or phone in this monthly drawing.",
          },
          409,
        );
      }
      throw error;
    }

    const consentRows = [];
    if (emailOptIn) {
      consentRows.push({
        source_type: "giveaway",
        source_entity_id: entry.id,
        channel: "email",
        contact_value: entrantEmail,
        action: "opt_in",
        consent_version: CONSENT_VERSION,
        consent_text: emailConsent[language],
        source_url: SOURCE_URL,
        ip_hash: limit.ipHash,
        user_agent: clean(req.headers.get("user-agent"), 500) || null,
      });
    }
    if (smsOptIn) {
      consentRows.push({
        source_type: "giveaway",
        source_entity_id: entry.id,
        channel: "sms",
        contact_value: entrantPhone,
        action: "opt_in",
        consent_version: CONSENT_VERSION,
        consent_text: smsConsent[language],
        source_url: SOURCE_URL,
        ip_hash: limit.ipHash,
        user_agent: clean(req.headers.get("user-agent"), 500) || null,
      });
    }
    if (consentRows.length) {
      const { error: consentError } = await admin.from("marketing_consents").insert(consentRows);
      if (consentError) throw consentError;
    }

    await sendOwnerEmail({
      id: entry.id,
      month: cycle.month,
      name: entrantName,
      email: entrantEmail,
      phone: entrantPhone,
      entryFor,
      nomineeName,
      relationship: nomineeRelationship,
      city,
      zip,
      category: needCategory,
      story,
      emailOptIn,
      smsOptIn,
    });

    return json(req, {
      ok: true,
      reference: entry.id.slice(0, 8).toUpperCase(),
      giveawayMonth: cycle.month,
      deadline: cycle.deadline,
      rollover: cycle.rollover,
    });
  } catch (error) {
    console.error("giveaway-api", error);
    return json(req, { error: "Unable to process giveaway entry." }, 500);
  }
});