import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

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
}

export const getGiveawayAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const [entries, consents] = await Promise.all([
      context.supabase
        .from("giveaway_entries")
        .select("*")
        .order("giveaway_month", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500),
      context.supabase
        .from("marketing_consents")
        .select("*")
        .eq("source_type", "giveaway")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    if (entries.error || consents.error) {
      throw new Error("Unable to load giveaway records.");
    }

    return {
      entries: entries.data ?? [],
      consents: consents.data ?? [],
    };
  });

export const updateGiveawayEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "new",
          "selected",
          "contacted",
          "scheduled",
          "completed",
          "ineligible",
          "declined",
        ]),
        privateNotes: z.string().trim().max(3000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("giveaway_entries")
      .update({
        status: data.status,
        private_notes: data.privateNotes || null,
        selected_at: data.status === "selected" ? new Date().toISOString() : null,
      })
      .eq("id", data.id);

    if (error) throw new Error("Unable to update giveaway entry.");
    return { ok: true as const };
  });

export const pickGiveawayWinner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ month: z.string().regex(/^\d{4}-\d{2}-01$/) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: winnerId, error } = await context.supabase.rpc("pick_giveaway_winner", {
      p_month: data.month,
    });
    if (error) throw new Error(error.message || "Unable to select a winner.");
    return { ok: true as const, winnerId };
  });
