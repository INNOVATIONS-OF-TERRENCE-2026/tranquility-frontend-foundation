import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const referenceSchema = z.string().regex(/^TLC-[0-9A-F]{8}$/);

export const createBookingCheckout = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({
        reference: referenceSchema,
        origin: z.string().url().max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { default: Stripe } = await import("stripe");

    const { data: hold, error } = await supabaseAdmin
      .from("booking_holds")
      .select("id, booking_reference, customer_email, estimate_cents, status, stripe_session_id")
      .eq("booking_reference", data.reference)
      .maybeSingle();
    if (error || !hold) throw new Error("Booking request not found.");
    if (hold.status !== "pending") throw new Error("This booking has already been paid.");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    // Reuse an open checkout session if the customer retries.
    if (hold.stripe_session_id) {
      const existing = await stripe.checkout.sessions.retrieve(hold.stripe_session_id);
      if (existing.status === "open" && existing.url) return { url: existing.url };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: hold.customer_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: hold.estimate_cents,
            product_data: {
              name: `Tranquility Level Cleaning - ${hold.booking_reference}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${data.origin}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/booking`,
      metadata: { hold_id: hold.id, reference: hold.booking_reference },
    });

    await supabaseAdmin
      .from("booking_holds")
      .update({ stripe_session_id: session.id })
      .eq("id", hold.id);

    if (!session.url) throw new Error("Unable to start secure checkout.");
    return { url: session.url };
  });

export const verifyBookingPayment = createServerFn({ method: "GET" })
  .validator((input) => z.object({ sessionId: z.string().trim().min(8).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.payment_status !== "paid") {
      return { status: "pending" as const };
    }

    const holdId = session.metadata?.hold_id;
    if (!holdId) throw new Error("Payment is missing its booking reference.");

    const { finalizePaidBooking } = await import("@/lib/booking-finalize.server");
    const { reference } = await finalizePaidBooking({
      holdId,
      paymentReference:
        typeof session.payment_intent === "string" ? session.payment_intent : session.id,
    });
    return { status: "paid" as const, reference };
  });
