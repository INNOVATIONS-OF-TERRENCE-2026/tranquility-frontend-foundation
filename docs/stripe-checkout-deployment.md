# Stripe Checkout deployment and safety gates

## Database migration: COMPLETED AND VERIFIED (2026-10-08)

**Owner-authorized source → destination reconciliation completed.** Source/current deployed app: project `qffnzhlxmuggzbndyjce`. Target: `baetmqwuqsmxveglhucg`.

| Table | Source before | Target after | Row ID/slug parity | Full normalized row checksum |
| --- | ---: | ---: | --- | --- |
| `booking_holds` | 4 | 4 | Pass | Pass |
| `contact_inquiries` | 4 | 4 | Pass | Pass |
| `quote_requests` | 1 | 1 | Pass | Pass |
| `service_cities` | 19 | 19 | Pass | Pass |

Migration preserved source IDs, booking references, timestamps, status, private notes and submitted JSON payloads for customer records. Existing destination city IDs were retained, with missing source cities added and ordering/metadata reconciled by slug. The source rows were not deleted. The operation was a single SQL transaction with mismatch checks and post-commit read-only comparison, and has been independently verified with row-count, ID/slug-set, and normalized-content checksums.

Source `quote_media`, `availability_blocks`, `career_applications`, `bookings` and `user_roles` had zero rows at audit time. Source Storage objects query returned no files. Destination has private `quote-media` bucket. There are no attached quote media records to migrate at this time.

**Cutover is NOT completed.** Production `main` still uses `qffnzhlxmuggzbndyjce`; only Stripe feature branch `.env` points to `baetmqwuqsmxveglhucg`. The original app can accept new submissions between this snapshot and release. Immediately before cutover, freeze intake or coordinate a short maintenance window, recopy any new or modified submissions from the source, rerun normalized row comparisons, verify auth/redirects/Edge Functions/RLS/quote uploads, run frontend regression tests, and then change the actual deployed environment. Merely changing a GitHub file does not verify hosted env overrides. Keep a rollback configuration. No Stripe live charge was activated.

Merchant: Tranquility Level Cleaning LLC
Merchant account: `acct_1UO83aK5fdqZqrwT`
Supabase project: `baetmqwuqsmxveglhucg`
Production website: `https://heytlcleaning.com`

## Current stage

The GitHub integration is prepared and the additive Supabase checkout schema and Edge Functions have been deployed. **Checkout is disabled.** No live transaction has been executed. Existing customer bookings are preserved.

Never commit a secret Stripe key or webhook signing secret into GitHub, Vite configuration, or the browser. The supplied `pk_live_...` key is a public client-side key and cannot create server-side Checkout Sessions.


## Live webhook: REGISTERED, SIGNING SECRET STORED

- Merchant Stripe account: `acct_1UO83aK5fdqZqrwT`, livemode.
- Webhook endpoint: `we_1UOEtxK5fdqZqrwTfPqa17P7`, Stripe reports `enabled`.
- URL: `https://baetmqwuqsmxveglhucg.supabase.co/functions/v1/stripe-webhook`.
- Subscribed events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`.
- Stripe webhook signing secret stored in Supabase encrypted Vault under `tlc_stripe_webhook_live`. **Never paste/commit the secret.** Only `service_role` can call `public.read_tlc_stripe_webhook_secret()`; `anon` and `authenticated` cannot.
- Active Supabase Edge Function `stripe-webhook` v2 prefers `STRIPE_WEBHOOK_SECRET` env and falls back to the encrypted Vault secret. HMAC signature and timestamp are checked before any database mutation.
- A verified Stripe session without an integration reservation marker is acknowledged and ignored so old Payment Links do not create false bookings.
- No customer charges or end-to-end live event deliveries were executed as part of creating this webhook. Signing/fulfillment should be smoke-tested in Stripe and observed in Supabase before enabling live checkout.

## GitHub Actions: RUNNER EXECUTION BLOCKED

The quality workflow fails even on the pre-existing `main` branch. Failed runs have 0 job steps, no runner assignment, GitHub reporting 0 ms billable runner time, and no usable log archive (GitHub API returns `BlobNotFound`). The Stripe PR diagnostics workflow shows the same behavior. Rerunning failed jobs reproduced the problem. This is not a verified formatter, lint, TypeScript, or build result: commands never ran.

**Repository owner action required:** inspect the check-run annotations and organization/repository Actions permissions, runner policy, and GitHub billing at `https://github.com/INNOVATIONS-OF-TERRENCE-2026/tranquility-frontend-foundation/actions/runs/37766067915`. Once GitHub allocates runners, rerun `Frontend Quality` and fix any genuine code issues reported by `format:check`, `lint`, `typecheck` or `build`. Do not merge while these checks remain unexecuted.

## Supabase Edge Function secrets

Set these in the Supabase Dashboard, Edge Functions -> Secrets:

| Secret | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_...` while validating; `sk_live_...` only after final live release |
| `STRIPE_WEBHOOK_SECRET` | Optional Edge secret override. For the live endpoint, encrypted Vault key `tlc_stripe_webhook_live` is already installed with service-role-only access. |
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
