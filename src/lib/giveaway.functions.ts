import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CONSENT_VERSION = "giveaway-2026-10-v2";
const SOURCE_URL = "https://heytlcleaning.com/giveaway";

const entrySchema = z.object({
  entrantName: z.string().trim().min(2).max(100),
  entrantEmail: z.string().trim().email().max(255),
  entrantPhone: z.string().trim().min(10).max(30),
  entryFor: z.enum(["self", "someone_else"]),
  nomineeName: z.string().trim().max(100).optional(),
  nomineeRelationship: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().regex(/^\d{5}$/),
  needCategory: z.enum([
    "postpartum",
    "mental_health_clutter",
    "recovery",
    "disability_support",
    "veteran_support",
    "other",
  ]),
  story: z.string().trim().min(20).max(2500),
  age18: z.literal(true),
  marketingEmailOptIn: z.boolean(),
  marketingSmsOptIn: z.boolean(),
  language: z.enum(["en", "es"]),
  website: z.string().max(0),
});

export type GiveawayStatus = {
  ok: true;
  month: string;
  deadline: string;
  rollover: boolean;
};

export type GiveawayEntryResponse = {
  ok: true;
  reference: string;
  giveawayMonth: string;
  deadline: string;
  rollover: boolean;
};

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

function giveawayCycle(now = new Date()) {
  const current = chicagoDateParts(now);
  const target =
    current.day <= 3
      ? { year: current.year, month: current.month }
      : current.month === 12
        ? { year: current.year + 1, month: 1 }
        : { year: current.year, month: current.month + 1 };
  const month = `${target.year}-${String(target.month).padStart(2, "0")}-01`;
  const deadline = `${target.year}-${String(target.month).padStart(2, "0")}-03`;
  return { month, deadline, rollover: current.day > 3 };
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

const emailConsent = {
  en: "I agree to receive occasional promotional emails from Tranquility Level Cleaning. Consent is optional and is not required to enter or purchase services. I can unsubscribe at any time.",
  es: "Acepto recibir correos promocionales ocasionales de Tranquility Level Cleaning. El consentimiento es opcional y no es necesario para participar ni comprar servicios. Puedo cancelar la suscripción en cualquier momento.",
};

const smsConsent = {
  en: "I confirm I am the subscriber or authorized user of the number provided and agree to receive recurring promotional text messages from Tranquility Level Cleaning at that number. Consent is optional and is not required to enter or purchase services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.",
  es: "Confirmo que soy el suscriptor o usuario autorizado del número proporcionado y acepto recibir mensajes de texto promocionales recurrentes de Tranquility Level Cleaning en ese número. El consentimiento es opcional y no es necesario para participar ni comprar servicios. La frecuencia de mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar o HELP para obtener ayuda.",
};

export const getGiveawayStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { ok: true as const, ...giveawayCycle() };
});

export const submitGiveawayEntry = createServerFn({ method: "POST" })
  .validator((input) => entrySchema.parse(input))
  .handler(async ({ data }): Promise<GiveawayEntryResponse> => {
    const cycle = giveawayCycle();

    // Honeypot: silently accept bot submissions without storing anything.
    if (data.website !== "") {
      return { ok: true, reference: "RECEIVED", giveawayMonth: cycle.month, ...cycle };
    }

    const language = data.language === "es" ? "es" : "en";
    const entrantEmail = data.entrantEmail.toLowerCase();
    const entrantPhone = normalizePhone(data.entrantPhone);
    if (entrantPhone.length !== 10) {
      throw new Error("Please enter a valid 10-digit phone number.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: entry, error } = await supabaseAdmin
      .from("giveaway_entries")
      .insert({
        giveaway_month: cycle.month,
        entrant_name: data.entrantName,
        entrant_email: entrantEmail,
        entrant_phone: entrantPhone,
        entry_for: data.entryFor,
        nominee_name: data.entryFor === "someone_else" ? (data.nomineeName ?? null) : null,
        nominee_relationship:
          data.entryFor === "someone_else" ? (data.nomineeRelationship ?? null) : null,
        city: data.city,
        zip: data.zip,
        need_category: data.needCategory,
        story: data.story,
        marketing_email_opt_in: data.marketingEmailOptIn,
        marketing_sms_opt_in: data.marketingSmsOptIn,
        consent_version: CONSENT_VERSION,
        language,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          language === "es"
            ? "Ya existe una participación para este correo o teléfono en este sorteo mensual."
            : "An entry already exists for this email or phone in this monthly drawing.",
        );
      }
      console.error("giveaway entry insert failed", error.message);
      throw new Error("Unable to process giveaway entry.");
    }

    const consentRows = [];
    if (data.marketingEmailOptIn) {
      consentRows.push({
        source_type: "giveaway",
        source_entity_id: entry.id,
        channel: "email",
        contact_value: entrantEmail,
        action: "opt_in",
        consent_version: CONSENT_VERSION,
        consent_text: emailConsent[language],
        source_url: SOURCE_URL,
      });
    }
    if (data.marketingSmsOptIn) {
      consentRows.push({
        source_type: "giveaway",
        source_entity_id: entry.id,
        channel: "sms",
        contact_value: entrantPhone,
        action: "opt_in",
        consent_version: CONSENT_VERSION,
        consent_text: smsConsent[language],
        source_url: SOURCE_URL,
      });
    }
    if (consentRows.length) {
      const { error: consentError } = await supabaseAdmin
        .from("marketing_consents")
        .insert(consentRows);
      if (consentError) {
        console.error("giveaway consent insert failed", consentError.message);
      }
    }

    return {
      ok: true,
      reference: entry.id.slice(0, 8).toUpperCase(),
      giveawayMonth: cycle.month,
      deadline: cycle.deadline,
      rollover: cycle.rollover,
    };
  });
