import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const languageSchema = z.enum(["en", "es"]);
const nameSchema = z.string().trim().min(2).max(100);
const emailSchema = z.string().trim().email().max(255);
const phoneSchema = z.string().trim().min(10).max(30);
const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(1200);

const contactSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  serviceType: z.enum(["standard", "deep", "move", "commercial", "quote", "other"]),
  preferredDate: z.string().date().optional(),
  notes: longText.min(10),
  language: languageSchema,
  website: z.string().max(0),
});

const careerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: shortText.min(2),
  reliableTransportation: z.boolean(),
  experience: longText.min(10),
  availability: longText.min(3),
  additionalInformation: longText.optional(),
  language: languageSchema,
  website: z.string().max(0),
});

const quoteSchema = z.object({
  propertyType: z.enum(["residential", "commercial", "specialty"]),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: shortText.min(2),
  approximateSize: shortText.optional(),
  scope: longText.min(10),
  desiredTiming: shortText.optional(),
  contactPreference: z.enum(["phone", "email", "text", "video"]),
  notes: longText.optional(),
  language: languageSchema,
  website: z.string().max(0),
});

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .validator((input) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await admin();
    const { data: row, error } = await client
      .from("contact_inquiries")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        service_type: data.serviceType,
        preferred_date: data.preferredDate || null,
        notes: data.notes,
        language: data.language,
      })
      .select("id")
      .single();
    if (error) throw new Error("Unable to save the inquiry.");
    return { ok: true as const, reference: row.id.slice(0, 8).toUpperCase() };
  });

export const submitCareerApplication = createServerFn({ method: "POST" })
  .validator((input) => careerSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await admin();
    const { data: row, error } = await client
      .from("career_applications")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        reliable_transportation: data.reliableTransportation,
        experience: data.experience,
        availability: data.availability,
        additional_information: data.additionalInformation || null,
        language: data.language,
      })
      .select("id")
      .single();
    if (error) throw new Error("Unable to save the application.");
    return { ok: true as const, reference: row.id.slice(0, 8).toUpperCase() };
  });

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .validator((input) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await admin();
    const { data: row, error } = await client
      .from("quote_requests")
      .insert({
        property_type: data.propertyType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        approximate_size: data.approximateSize || null,
        scope: data.scope,
        desired_timing: data.desiredTiming || null,
        contact_preference: data.contactPreference,
        notes: data.notes || null,
        language: data.language,
      })
      .select("id")
      .single();
    if (error) throw new Error("Unable to save the quote request.");
    return { ok: true as const, reference: row.id.slice(0, 8).toUpperCase() };
  });
