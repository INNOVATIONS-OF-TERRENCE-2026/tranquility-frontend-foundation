import { createServerFn } from "@tanstack/react-start";

// Incomplete Lovable checkout was replaced by the pre-existing Supabase Edge
// Stripe Checkout flow. Do not revive this alternative payment processor.
export const createBookingCheckout = createServerFn({ method: "POST" }).handler(async () => {
  throw new Error("Use the integrated booking flow and Supabase Stripe Checkout.");
});

export const verifyBookingPayment = createServerFn({ method: "GET" }).handler(async () => {
  throw new Error("Use the signed Supabase Stripe Checkout status endpoint.");
});
