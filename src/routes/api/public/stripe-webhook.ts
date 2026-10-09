import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!signature || !secret) {
          return new Response("Webhook not configured", { status: 400 });
        }

        const body = await request.text();
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-08-27.basil",
        });

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, signature, secret);
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const holdId = session.metadata?.hold_id;
          if (holdId && session.payment_status === "paid") {
            const { finalizePaidBooking } = await import("@/lib/booking-finalize.server");
            await finalizePaidBooking({
              holdId,
              paymentReference:
                typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
