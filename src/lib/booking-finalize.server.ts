import { business } from "@/config/business";
import { money } from "@/config/pricing";

interface FinalizeInput {
  holdId: string;
  paymentReference: string;
}

/**
 * Idempotently converts a booking hold into a paid booking and notifies the
 * owner. Safe to call from both the Stripe webhook and the success-page
 * verification path.
 */
export async function finalizePaidBooking({ holdId, paymentReference }: FinalizeInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: hold, error: holdError } = await supabaseAdmin
    .from("booking_holds")
    .select("*")
    .eq("id", holdId)
    .maybeSingle();
  if (holdError || !hold) throw new Error("Booking hold not found.");

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
      deposit_cents: hold.estimate_cents,
      payment_reference: paymentReference,
      payment_status: "paid",
      request_payload: hold.request_payload,
    });
    if (insertError) throw new Error("Unable to record the paid booking.");

    await supabaseAdmin.from("booking_holds").update({ status: "confirmed" }).eq("id", hold.id);

    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("booking-confirmation", business.email, {
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
        },
        idempotencyKey: `booking-confirmation-${hold.id}`,
      });
    } catch (error) {
      console.error("booking confirmation email failed", error);
    }
  }

  return { reference: hold.booking_reference as string };
}
