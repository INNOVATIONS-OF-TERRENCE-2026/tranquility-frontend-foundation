import { business } from "@/config/business";
import { money } from "@/config/pricing";

interface SessionLike {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  payment_intent: string | { id: string } | null;
  metadata: Record<string, string> | null;
}

/** Re-derives payability from the stored server estimate. */
export function isPayableHold(payload: unknown) {
  const p = payload as { estimate?: { total?: number }; partialHome?: boolean; sqft?: number | null };
  if (!p?.estimate?.total || p.estimate.total <= 0) return false;
  if (p.partialHome) return false;
  if (typeof p.sqft === "number" && p.sqft >= 3000) return false;
  return true;
}

/**
 * Verifies a Stripe Checkout Session against the booking hold, then
 * idempotently converts the hold into a paid booking and notifies the owner.
 * Used by both the webhook (authoritative) and the confirmation page.
 */
export async function finalizeFromSession(session: SessionLike) {
  const holdId = session.metadata?.["hold_id"];
  const reference = session.metadata?.["reference"];
  if (session.payment_status !== "paid" || !holdId || !reference) {
    throw new Error("Session is not a paid booking.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: hold, error: holdError } = await supabaseAdmin
    .from("booking_holds")
    .select("*")
    .eq("id", holdId)
    .maybeSingle();
  if (holdError || !hold) throw new Error("Booking hold not found.");
  if (hold.booking_reference !== reference) throw new Error("Reference mismatch.");
  if (hold.stripe_session_id && hold.stripe_session_id !== session.id) {
    throw new Error("Session mismatch.");
  }
  if (session.amount_total !== hold.estimate_cents || session.currency !== "usd") {
    throw new Error("Amount mismatch.");
  }

  const paymentReference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  const { data: existing } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("hold_id", hold.id)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from("bookings").insert({
      booking_reference: hold.booking_reference,
      hold_id: hold.id,
      service_type: hold.service_type,
      frequency: hold.frequency,
      service_date: hold.service_date,
      arrival_window: hold.arrival_window,
      customer_name: hold.customer_name,
      customer_email: hold.customer_email,
      customer_phone: hold.customer_phone,
      service_address: hold.service_address,
      city: hold.city,
      zip: hold.zip,
      estimate_cents: hold.estimate_cents,
      deposit_cents: session.amount_total,
      payment_reference: paymentReference,
      payment_status: "paid",
      request_payload: hold.request_payload,
    });
    // A unique-violation means a concurrent call already recorded it.
    if (insertError && insertError.code !== "23505") {
      throw new Error("Unable to record the paid booking.");
    }

    await supabaseAdmin
      .from("booking_holds")
      .update({ status: "confirmed", stripe_session_id: session.id })
      .eq("id", hold.id);

    if (!insertError) {
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        await sendTemplateEmail("booking-confirmation", business.email, {
          replyTo: hold.customer_email,
          subject: `PAID BOOKING | Tranquility Level Cleaning | ${hold.booking_reference}`,
          templateData: {
            reference: hold.booking_reference,
            customerName: hold.customer_name,
            customerEmail: hold.customer_email,
            customerPhone: hold.customer_phone,
            service: hold.service_type,
            frequency: hold.frequency === "onetime" ? "One-time" : hold.frequency,
            serviceDate: hold.service_date,
            arrivalWindow: hold.arrival_window,
            address: `${hold.service_address}, ${hold.city}, TX ${hold.zip}`,
            total: money(hold.estimate_cents / 100),
            paymentReference,
          },
          idempotencyKey: `booking-confirmation-${hold.id}`,
        });
      } catch (error) {
        console.error("booking confirmation email failed", error);
      }
    }
  }

  return {
    reference: hold.booking_reference as string,
    serviceType: hold.service_type as string,
    serviceDate: hold.service_date as string,
    amountCents: hold.estimate_cents as number,
  };
}
