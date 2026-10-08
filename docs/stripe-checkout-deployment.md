# Stripe Checkout deployment and safety gates

Merchant: Tranquility Level Cleaning LLC
Merchant account: `acct_1UO83aK5fdqZqrwT`
Supabase project: `baetmqwuqsmxveglhucg`
Production website: `https://heytlcleaning.com`

## Current stage

The GitHub integration is prepared and the additive Supabase checkout schema and Edge Functions have been deployed. **Checkout is disabled.** No live transaction has been executed. Existing customer bookings are preserved.

Never commit a secret Stripe key or webhook signing secret into GitHub, Vite configuration, or the browser. The supplied `pk_live_...` key is a public client-side key and cannot create server-side Checkout Sessions.

## Supabase Edge Function secrets

Set these in the Supabase Dashboard, Edge Functions -> Secrets:

| Secret | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_...` while validating; `sk_live_...` only after final live release |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the matching test or live webhook endpoint |
| `STRIPE_PRODUCT_STANDARD` | Correct environment's verified Standard Cleaning product ID |
| `STRIPE_PRODUCT_DEEP` | Correct environment's verified Deep Cleaning product ID |
| `STRIPE_PRODUCT_MOVE` | Correct environment's verified Move-In / Move-Out product ID |
| `STRIPE_CHECKOUT_ENABLED` | Set to `true` for supervised test-mode validation; unset or `false` otherwise |
| `STRIPE_TAX_CONFIRMED` | Set to `true` only after Texas sales tax registration and settings have been verified |
| `STRIPE_LIVE_APPROVED` | Set to `true` only after owner approval of live charges |

Supabase provides `SUPABASE_URL` and an appropriate server key. Never print or distribute their values.

## Endpoints

- Checkout: `https://baetmqwuqsmxveglhucg.supabase.co/functions/v1/stripe-checkout`
- Webhook: `https://baetmqwuqsmxveglhucg.supabase.co/functions/v1/stripe-webhook`

The Stripe webhook endpoint must be created in the Stripe Dashboard. Subscribe to these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`

Checkout customer calls use a browser Supabase publishable key. Webhooks are unsigned by Supabase JWT design but require a valid Stripe signature.

## Frontend activation

The existing booking-request behavior remains unchanged unless the frontend deployment explicitly sets:

`VITE_STRIPE_CHECKOUT_ENABLED=true`

**Do not set this during development unless Supabase Checkout test-mode secrets, product IDs, webhook test delivery and tax configuration are ready.**

On activation, standard fixed-scope bookings use the integrated Stripe Checkout flow. Custom review cases continue using the existing booking-request / custom quote path.

## Tax and product-mapping blockers

The supplied Stripe export shows test Payment Links whose names conflict with two link IDs described in the customer's original setup note. Verify products and active Prices independently using Stripe API before accepting charges. Do not infer active product mappings from QR code filenames.

The separately supplied additional Move-In / Move-Out product ID must not be used without verification. Stripe Tax must be configured for the appropriate Texas cleaning-service tax classification and service location.

## Required acceptance tests

1. Three service base amounts: $145, $215, $235.
2. Approved Standard discounts: weekly $116, biweekly $123, monthly $131.
3. Scope / add-on calculations use server rules.
4. Custom-review configurations do not pay automatically.
5. Two customers competing for the last available slot do not both reserve it.
6. Abandoned Checkout sessions expire and release capacity only after verified expiration.
7. Stripe webhook signature invalid or replayed events do not create charges or duplicate bookings.
8. Payment succeeds, creates exactly one booking, and displays a verified receipt status.
9. Refund/dispute events update financial reconciliation without reopening the scheduled appointment.
10. English and Spanish user flows, admin functionality, and Lucy Intelligence regressions pass.
11. Production merchant account and live Product IDs match the intended account.
12. Owner explicitly authorizes live activation after tax and operational review.

## Current limitations requiring a second pass

- Staff-resource scheduling is currently 5 positions per service per window, not true employee-shift capacity.
- Webhook asynchronous failure queues, payment support workflows, and scheduled reconciliation need full operational testing.
- Refund authorizations and owner-side refund UI are intentionally not activated.
- Stripe secrets, production merchant activation, and tax registration are not supplied by these files.

**Do not merge and switch on live payments until these release blockers are resolved.**
