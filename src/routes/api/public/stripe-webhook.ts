import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 500 });
        if (!signature) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, signature, secret);
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const session = event.data.object;
          if (session.payment_status === "paid" && session.metadata?.["hold_id"]) {
            const { finalizeFromSession } = await import("@/lib/booking-finalize.server");
            try {
              await finalizeFromSession(session);
            } catch (error) {
              console.error("stripe webhook finalize failed", error);
              return new Response("Finalize failed", { status: 500 });
            }
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
