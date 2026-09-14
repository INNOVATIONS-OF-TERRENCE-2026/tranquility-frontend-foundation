# Real Booking Calendar and Secure Admin Panel

## Goal

Give customers a bilingual, mobile-friendly calendar that shows real availability for their selected service and frequency, then stores a pending booking request with a reference number. Give the owner a private admin area for booking requests, quote submissions, career applications, and schedule blocks.

Payments remain out of scope until Stripe is explicitly authorized. A submitted booking is a **request**, not a confirmed or paid appointment.

## Confirmed decisions

- Slot capacity is **five customers per service, per arrival window**.
- Frequency is selected and validated, but does not multiply capacity within a service.
- Availability uses capacity plus owner-managed date/window blocks.
- Admin actions include status changes, rescheduling, private notes, and permanent deletion with confirmation.
- Admin sign-in supports email/password and Google.
- No profile table or profile data is needed.
- The first administrator is the verified account for `tlcllc26@gmail.com`.
- Existing bilingual content, pricing rules, commercial quote-only behavior, and official branding remain unchanged.

## Current foundation verified

- The booking flow already collects service, valid frequency, scope, add-ons, contact information, a weekday, and one of three approved windows.
- The current date control is a native date field and availability is fetched only after one date is selected.
- Current capacity is global across services; it must be changed to per-service capacity.
- The final booking action still opens an email draft instead of storing the request.
- Private tables already store quote and career submissions. Booking hold and booking tables exist, but there are no booking rows yet.
- All current customer-data tables deny direct anonymous and authenticated access; no admin read/write policies exist.
- The project already has the generated authentication middleware and bearer-token attachment needed for protected server requests.
- Calendar and popover controls are already available in the design system.

## Customer booking calendar

1. Replace the native date field and window dropdown with a reusable bilingual booking calendar.
2. Fetch one month of availability at a time for the selected service and frequency so dates can be marked before selection:
   - available
   - limited availability
   - full
   - blocked/unavailable
3. Disable weekends, past dates, fully booked dates, and owner-blocked dates.
4. After a customer selects a date, show the approved 8–11 AM, 11 AM–2 PM, and 2–5 PM windows as large accessible buttons with remaining capacity.
5. Reset the selected date/window whenever changing service makes the current choice invalid. Deep Clean and Move-In/Move-Out remain one-time only.
6. Keep frequency visible in the request and enforce all approved service/frequency combinations on the server.
7. On final review, submit a validated booking request to the backend, atomically recheck capacity, calculate pricing from the centralized pricing configuration, and return a short reference number.
8. Replace the email-draft action with a clear success screen stating that the request was received and still requires Tranquility’s confirmation. Preserve phone and custom-quote alternatives.
9. Prevent duplicate clicks, show loading/error states, and return a friendly “slot just filled” message if capacity changes before submission.

## Availability and booking data

Create one reviewed database migration that:

- Adds an `availability_blocks` table supporting a date or date range, all services or one service, and a full-day or one-window block.
- Adds management fields to booking requests, quote requests, and career applications: controlled status, private notes, and updated timestamp.
- Evolves the existing booking-hold workflow into durable pending booking requests while payments are disabled; pending and confirmed future requests consume capacity, while cancelled requests do not.
- Updates the atomic reservation function to lock and count capacity by `service_date + service_type + arrival_window`, include active requests/bookings, and reject matching availability blocks.
- Adds indexes for month availability and admin sorting/filtering.
- Adds explicit grants, RLS, and narrowly scoped admin policies in the same migration.

The implementation will not trust customer-supplied prices, owner IDs, roles, status values, or availability counts.

## Secure admin access

1. Enable email/password authentication and managed Google sign-in during implementation.
2. Add a public `/auth` page with:
   - email/password sign-in
   - one-time account creation for the designated owner email
   - Google sign-in
   - forgot-password flow
3. Add the required public `/reset-password` page for recovery links.
4. Keep email confirmation enabled. A new email/password account sees “check your email” until ownership is verified.
5. Add a separate `user_roles` table and server-side `has_role` check; do not store roles in profiles, browser storage, or editable user metadata.
6. Add a server-only bootstrap action that grants the first admin role only when the authenticated, verified email exactly matches `tlcllc26@gmail.com`. No caller-supplied user ID can control role assignment.
7. Place `/admin` beneath the existing protected-route architecture and add an admin-role gate. Every admin server function independently validates both authentication and the admin role.
8. Add session-aware Admin/Sign out controls without exposing the admin panel in normal customer navigation to signed-out visitors.

## Admin panel

Build a calm, responsive private workspace with:

- **Overview:** counts for new booking requests, quotes, and career applications, plus upcoming capacity alerts.
- **Booking requests:** searchable/filterable list and detail view with customer scope, estimate, selected slot, status, private notes, reschedule controls, and permanent delete confirmation.
- **Quotes:** searchable/filterable submissions with full request details, status, private notes, and delete confirmation.
- **Careers:** searchable/filterable applications with full applicant details, status, private notes, and delete confirmation.
- **Availability:** calendar/list controls to block or reopen a date range, all services or one service, and a whole day or one arrival window.

Use compact tables on desktop and readable stacked records on mobile. All controls have accessible labels, keyboard operation, visible focus, loading states, empty states, and bilingual interface text.

## Technical implementation

- Add authenticated server functions for paginated lists, detail reads, updates, rescheduling, availability blocks, and deletes.
- Use the authenticated backend client under RLS for ordinary admin reads/writes; use privileged access only for the verified one-time role bootstrap.
- Use TanStack Query for admin lists and mutations, invalidate affected counts/calendar data after changes, and keep server-rendered public routes free of protected calls.
- Register one root authentication-state listener for route/cache refresh and follow ordered sign-out cache cleanup.
- Add unique metadata to new public auth/recovery pages and `noindex` metadata to private admin pages.
- Update generated database types after the migration; do not edit generated integration files manually.

## Verification

- Confirm email/password signup, email confirmation state, login, password reset, Google sign-in, sign-out, unauthorized redirects, and non-admin denial.
- Confirm the verified `tlcllc26@gmail.com` account receives the admin role and another authenticated account cannot self-promote.
- Verify admin list/read/update/reschedule/note/delete operations under RLS.
- Verify five slots independently for Standard, Deep, and Move service windows; confirm the sixth concurrent request is rejected.
- Verify full-day, one-window, all-service, and service-specific blocks.
- Verify cancelled/deleted/rescheduled requests release the correct capacity and the old slot updates immediately.
- Verify English and Spanish, keyboard/screen-reader behavior, reduced motion, dark/light/system themes, and mobile widths starting at 320px.
- Run database security lint, focused lint/type checks, production build, and browser checks with no console or network errors.
