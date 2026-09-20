import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const sectionSchema = z.enum(["bookings", "quotes", "careers", "inquiries"]);
const statusSchema = z.string().trim().min(2).max(30);
const OWNER_EMAIL = "tlcllc26@gmail.com";

async function requireAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.auth.getUser();
  const user = data.user;
  if (
    error ||
    !user ||
    user.id !== context.userId ||
    !user.email_confirmed_at ||
    user.email?.toLowerCase() !== OWNER_EMAIL
  ) {
    throw new Error("Forbidden");
  }
  return user;
}

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    return { ok: true as const };
  });

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const [bookings, quotes, careers, inquiries, blocks, media] = await Promise.all([
      context.supabase
        .from("booking_holds")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("availability_blocks")
        .select("*")
        .order("start_date", { ascending: true })
        .limit(200),
      context.supabase
        .from("quote_media")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(500),
    ]);

    const failure = [bookings, quotes, careers, inquiries, blocks, media].find(
      (result) => result.error,
    )?.error;
    if (failure) throw new Error("Unable to load administrator records.");

    const quoteMedia = await Promise.all(
      (media.data ?? []).map(async (item) => {
        const { data } = await context.supabase.storage
          .from("quote-media")
          .createSignedUrl(item.object_path, 15 * 60);
        return { ...item, signed_url: data?.signedUrl ?? null };
      }),
    );

    return {
      bookings: bookings.data ?? [],
      quotes: quotes.data ?? [],
      careers: careers.data ?? [],
      inquiries: inquiries.data ?? [],
      blocks: blocks.data ?? [],
      quoteMedia,
    };
  });

export const updateAdminRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        section: sectionSchema,
        id: z.string().uuid(),
        status: statusSchema,
        privateNotes: z.string().trim().max(3000),
        serviceDate: z.string().date().optional(),
        arrivalWindow: z.enum(["morning", "midday", "afternoon"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const table =
      data.section === "bookings"
        ? "booking_holds"
        : data.section === "quotes"
          ? "quote_requests"
          : data.section === "careers"
            ? "career_applications"
            : "contact_inquiries";
    const allowed =
      data.section === "bookings"
        ? ["pending", "confirmed", "completed", "cancelled"]
        : ["new", "reviewing", "contacted", "closed"];
    if (!allowed.includes(data.status)) throw new Error("Invalid status.");

    const baseValues = { status: data.status, private_notes: data.privateNotes || null };
    const values =
      data.section === "bookings" && data.serviceDate && data.arrivalWindow
        ? { ...baseValues, service_date: data.serviceDate, arrival_window: data.arrivalWindow }
        : baseValues;

    const { error } = await context.supabase.from(table).update(values).eq("id", data.id);
    if (error) throw new Error("Unable to update this record.");
    return { ok: true as const };
  });

export const deleteAdminRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ section: sectionSchema, id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const table =
      data.section === "bookings"
        ? "booking_holds"
        : data.section === "quotes"
          ? "quote_requests"
          : data.section === "careers"
            ? "career_applications"
            : "contact_inquiries";
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw new Error("Unable to delete this record.");
    return { ok: true as const };
  });

export const createAvailabilityBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        startDate: z.string().date(),
        endDate: z.string().date(),
        serviceType: z.enum(["standard", "deep", "move"]).nullable(),
        arrivalWindow: z.enum(["morning", "midday", "afternoon"]).nullable(),
        reason: z.string().trim().max(300),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.endDate < data.startDate) {
      throw new Error("End date must be on or after start date.");
    }
    const { error } = await context.supabase.from("availability_blocks").insert({
      start_date: data.startDate,
      end_date: data.endDate,
      service_type: data.serviceType,
      arrival_window: data.arrivalWindow,
      reason: data.reason || null,
      created_by: context.userId,
    });
    if (error) throw new Error("Unable to block availability.");
    return { ok: true as const };
  });

export const deleteAvailabilityBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("availability_blocks").delete().eq("id", data.id);
    if (error) throw new Error("Unable to reopen availability.");
    return { ok: true as const };
  });
