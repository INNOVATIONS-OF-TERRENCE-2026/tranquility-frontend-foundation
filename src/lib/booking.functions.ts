import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const dateSchema = z.string().date();

export const getBookingAvailability = createServerFn({ method: "GET" })
  .validator((input) => z.object({ date: dateSchema }).parse(input))
  .handler(async ({ data }) => {
    const selected = new Date(`${data.date}T12:00:00Z`);
    if (Number.isNaN(selected.getTime()) || [0, 6].includes(selected.getUTCDay())) {
      return { morning: 0, midday: 0, afternoon: 0 };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [holds, bookings] = await Promise.all([
      supabaseAdmin
        .from("booking_holds")
        .select("arrival_window")
        .eq("service_date", data.date)
        .eq("status", "awaiting_payment")
        .gt("expires_at", new Date().toISOString()),
      supabaseAdmin
        .from("bookings")
        .select("arrival_window")
        .eq("service_date", data.date)
        .eq("payment_status", "paid"),
    ]);

    if (holds.error || bookings.error) throw new Error("Unable to check availability.");
    const remaining = { morning: 5, midday: 5, afternoon: 5 };
    for (const row of [...(holds.data ?? []), ...(bookings.data ?? [])]) {
      const window = row.arrival_window as keyof typeof remaining;
      if (window in remaining) remaining[window] = Math.max(0, remaining[window] - 1);
    }
    return remaining;
  });
