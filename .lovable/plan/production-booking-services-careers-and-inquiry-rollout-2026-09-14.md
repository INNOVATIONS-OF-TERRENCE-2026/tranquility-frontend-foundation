# Production booking, services, careers, and inquiry rollout

## Goal
Turn the existing customer-facing foundation into a complete operational flow: richer service pages, an evergreen careers opportunity, real inquiry delivery, live appointment capacity, a $100 booking deposit, and a clear paid confirmation experience.

## What the audit confirmed
- Careers already has a bilingual interest form, but it currently opens the applicant's email app and has no job listing.
- Contact, custom quote, careers, and booking currently rely on prefilled email drafts rather than real submissions.
- The booking experience already calculates approved room and add-on pricing and ends with a review step, but it does not reserve availability or accept payment.
- The service-area experience already uses a live Google Maps embed with 15 approved DFW cities and a radius explorer.
- The three residential service pages share a concise detail layout. Their shared pricing panel currently displays recurring prices for every service, which conflicts with the approved one-time-only rule for Deep Clean and Move-In/Move-Out.
- No backend, persisted availability, email delivery service, or payment integration is currently enabled.

## Build plan

### 1. Add the required production foundation
- Enable Lovable Cloud for secure storage of appointment slots, bookings, payments, job applications, quote requests, and contact inquiries.
- Enable Stripe's test environment when payment implementation is authorized. Use Stripe for the fixed $100 cleaning-service reservation deposit.
- Configure transactional email delivery to `tlcllc26@gmail.com`, with customer acknowledgements where appropriate.
- Keep all secrets and payment operations server-side.

### 2. Careers page
- Add one bilingual evergreen **Cleaning Professional Interest** listing without claiming an active vacancy, fixed pay, benefits, or employment terms that were not supplied.
- Present responsibilities and applicant expectations using only approved language already supported by the site.
- Replace the email-draft-only application with a validated real submission that emails Treva and stores a minimal application record.
- Add a separate “Email Treva about a job” action for direct job requests.
- Keep the privacy warning and prohibit sensitive identity, banking, and onboarding documents.

### 3. Full residential service pages and pricing tiers
- Expand Standard Clean, Deep Clean, and Move-In/Move-Out into complete bilingual pages with included work, best-fit guidance, exclusions/quote triggers, approved add-ons, pricing assumptions, and direct booking actions.
- Keep Standard Clean at $145+ with one-time, weekly 20%, bi-weekly 15%, and monthly 10% options.
- Keep Deep Clean at $215+ and Move-In/Move-Out at $235+, both one-time only across detail pages, pricing displays, and booking choices.
- Add the shared interactive DFW map explorer to each residential service page, using the existing approved city coordinates and coverage disclaimer.
- Preserve commercial cleaning as consultation/custom quote only.

### 4. Real availability and booking
- Replace the preference-only date field with an availability calendar backed by stored appointment slots.
- Offer weekday windows only: 8–11 AM, 11 AM–2 PM, and 2–5 PM.
- Allow up to **5 confirmed bookings per time window**, interpreted from the supplied capacity value.
- Recheck and reserve capacity server-side before checkout so two customers cannot claim the final opening.
- Keep the current service, frequency, scope, room quantity, add-on, estimate, and custom-review rules.
- Requests requiring custom review cannot enter instant paid confirmation; they route to the real quote flow instead.

### 5. Deposit checkout and confirmation
- After the existing review step, create a Stripe checkout for a fixed **$100 deposit**.
- Show the estimated service total, deposit, and estimated remaining balance separately before payment.
- Finalize the booking only after verified payment success; use an idempotent payment callback so duplicate events cannot create duplicate bookings.
- Show a dedicated bilingual confirmation screen with booking reference, service, confirmed date/window, deposit receipt status, estimated remaining balance, and contact actions.
- Send the complete booking details to Treva and a confirmation to the customer.
- Update Terms and Privacy narrowly for deposits, payment processing, stored booking/application data, and cancellation/refund language only after the business supplies the actual policy; do not invent one.

### 6. Real contact and quote delivery
- Convert Contact and Custom Quote into server-validated submissions that reach `tlcllc26@gmail.com` without requiring the visitor's email app.
- Add the requested Contact fields: name, phone, email, service type, preferred date, and notes.
- Preserve quote photo limits; upload accepted images privately and include secure references in Treva's notification rather than putting public links in emails.
- Add success, retry, and failure states that never claim delivery unless the server confirms it.
- Retain direct call/email links as fallbacks.

### 7. Validation, security, and quality gate
- Define shared Zod schemas and enforce the same limits in the browser and on the server.
- Normalize and encode all submitted text; reject invalid service IDs, dates, slots, quantities, file types, and oversized uploads.
- Keep applicant, customer, address, and booking data private with least-privilege access rules.
- Verify English and Spanish, keyboard navigation, focus handling, reduced motion, 44px touch targets, all themes/palettes, and mobile through widescreen layouts.
- Test pricing invariants, availability capacity, concurrent reservation behavior, payment success/failure/cancellation, email delivery, and custom-quote routing.
- Run formatting, lint, type checks, production build, route checks, browser console/network checks, and payment test-mode checkout before launch.

## Required setup and decisions during implementation
- Payment setup remains deferred because “Plan only for now” was selected. Stripe must be enabled before checkout code is implemented.
- Real submissions and live slot capacity require Lovable Cloud and an email-sending domain to be configured before end-to-end delivery can be verified.
- A cancellation/refund policy and how the $100 deposit applies to the final invoice must be supplied before customer-facing legal/payment copy is finalized.

## Technical approach
- Use TanStack server functions for private app operations and a verified public server route for Stripe callbacks.
- Store slot capacity, temporary holds, bookings, submissions, and payment-event IDs in relational tables with row-level access controls and explicit grants.
- Use server-calculated pricing from the existing typed pricing configuration; never trust totals sent by the browser.
- Use transactional email templates for internal notifications and customer confirmations.
- Reuse the existing `ServiceAreaExplorer` rather than introducing a second map system.
