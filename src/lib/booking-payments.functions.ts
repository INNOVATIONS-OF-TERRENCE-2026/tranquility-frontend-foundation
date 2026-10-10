import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const referenceSchema = z.string().regex(/^TLC-[0-9A-F]{8}$/i);

const CANONICAL_ORIGIN = "https://heytlcleaning.com";
const ALLOWED_ORIGINS = new Set([
  CANONICAL_ORIGIN,
  "https://www.heytlcleaning.com",
  "https://heytlcleaning.lovable.app",
  "https://id-preview--585c89e8-eac0-47b8-a81e-af86a2afff7f.lovable.app",
  "http://localhost:8080",
]);

function safeOrigin(origin: string | undefined) {
  return origin && ALLOWED_ORIGINS.has(origin) ? origin : CANONICAL_ORIGIN;
}

export const createBookingCheckout = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({ reference: referenceSchema, origin: z.string().max(200).optional() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { default: Stripe } = await import("stripe");
    const { isPayableHold } = await import("@/lib/booking-finalize.server");

    const { data: hold, error } = await supabaseAdmin
      .from("booking_holds")
      .select(
        "id, booking_reference, service_type, customer_email, estimate_cents, status, stripe_session_id, request_payload",
      )
      .eq("booking_reference", data.reference.toUpperCase())
      .maybeSingle();
    if (error || !hold) throw new Error("Booking request not found.");
    if (hold.status !== "pending") throw new Error("This booking has already been paid.");
    if (!Number.isInteger(hold.estimate_cents) || hold.estimate_cents <= 0) {
      throw new Error("This booking needs a custom quote.");
    }
    if (!isPayableHold(hold.request_payload)) {
      throw new Error("This booking needs a custom quote.");
    }

    const { data: paid } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("hold_id", hold.id)
      .maybeSingle();
    if (paid) throw new Error("This booking has already been paid.");

    const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

    if (hold.stripe_session_id) {
      const existing = await stripe.checkout.sessions.retrieve(hold.stripe_session_id);
      if (existing.payment_status === "paid") throw new Error("This booking has already been paid.");
      if (existing.status === "open" && existing.url && existing.amount_total === hold.estimate_cents) {
        return { url: existing.url };
      }
    }

    const origin = safeOrigin(data.origin);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: hold.customer_email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: hold.estimate_cents,
              product_data: { name: `Tranquility Level Cleaning - ${hold.booking_reference}` },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking?checkout=cancelled`,
        metadata: {
          hold_id: hold.id,
          reference: hold.booking_reference,
          service_type: hold.service_type,
        },
      },
      { idempotencyKey: `checkout-${hold.id}-${hold.stripe_session_id ?? "first"}` },
    );

    await supabaseAdmin
      .from("booking_holds")
      .update({ stripe_session_id: session.id })
      .eq("id", hold.id);

    if (!session.url) throw new Error("Unable to start secure checkout.");
    return { url: session.url };
  });

export const verifyBookingPayment = createServerFn({ method: "GET" })
  .validator((input) =>
    z.object({ sessionId: z.string().trim().regex(/^cs_[A-Za-z0-9_]{8,200}$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(data.sessionId);
    } catch {
      return { status: "invalid" as const };
    }
    if (session.status === "expired") return { status: "invalid" as const };
    if (session.payment_status !== "paid") return { status: "pending" as const };

    const { finalizeFromSession } = await import("@/lib/booking-finalize.server");
    try {
      const result = await finalizeFromSession(session);
      return { status: "paid" as const, ...result };
    } catch {
      return { status: "invalid" as const };
    }
  });
