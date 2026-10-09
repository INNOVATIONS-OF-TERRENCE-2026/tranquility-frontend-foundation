import { createFileRoute } from "@tanstack/react-router";

// Legacy website webhook is deliberately retired to prevent competing payment
// fulfillment paths. Signed Stripe events use the Supabase Edge webhook only.
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async () => new Response("Webhook endpoint retired: use configured Supabase destination", {
        status: 410,
        headers: { "content-type": "text/plain" },
      }),
    },
  },
});
