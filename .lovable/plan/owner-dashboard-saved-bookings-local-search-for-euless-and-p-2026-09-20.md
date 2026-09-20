# Owner Dashboard, Saved Bookings, Local Search for Euless, and Publish

## What already exists (verified)

- Bookings, quotes, careers applications and contact inquiries already save to the database and survive refresh.
- The booking calendar already saves each request with date, arrival window, service type, frequency, rooms, add-ons and a reference number.
- The private owner workspace at `/admin` already lists bookings, quotes, careers and inquiries with status, private notes, rescheduling, deletion and date blocking.
- Euless is already one of the 15 listed service cities and appears on the service-area page.

So this round is about finishing the gaps, not rebuilding: service-area management, a real overview screen, Euless-area local search work, and publishing.

## 1. Service-area data in the dashboard (both editing and demand)

Today the covered cities live in code, so Treva cannot change them.

- Move the city list into the database (name, coordinates, active/inactive, display order), seeded with the current 15 cities so nothing visible changes.
- Add a "Service area" tab in the dashboard where Treva can add a city, rename it, turn it off, or reorder it. The public map, city list and radius tool read from the same source.
- Add a "Demand by city" view: how many bookings, quotes and inquiries came from each city, with a date range, so Treva can see where the work is coming from.

## 2. Owner dashboard overview

- New first tab with today's and this week's appointments in date order, plus counts of new bookings, quotes, applications and inquiries.
- Quick filters and search across every list (name, email, phone, city, reference).
- Clearer appointment cards showing service, date, arrival window, frequency, estimate and address.

## 3. Euless-focused local search

Focus cities: Euless as the lead, plus Bedford, Hurst, Colleyville and Grapevine.

- New city pages: `/house-cleaning-euless`, `/house-cleaning-bedford`, `/house-cleaning-hurst`, `/house-cleaning-colleyville`, `/house-cleaning-grapevine`, each with its own unique title, description, local intro copy, services, pricing links, map and booking call to action, in English and Spanish.
- Add local business structured data with the Euless-area service radius and the five focus cities, linked from the homepage and service-area page.
- Update homepage, service-area and service page titles and descriptions to mention Euless and the nearby cities naturally, without keyword stuffing.
- Add the new pages to the sitemap and cross-link them from the service-area page.

### Reviews and citations

No review content will be invented. You chose to skip reviews for now, and there is no Google Business Profile yet, so:

- No review section and no rating markup is added (fake ratings get sites penalized).
- Instead you get a short setup checklist: create the Google Business Profile for the Euless service area, then Bing Places, Apple Business Connect, Yelp, Nextdoor and the Texas directory listings, all using the exact same business name, phone and service area as the site.
- Once the profile is live and real reviews exist, a reviews section and rating markup can be added in a follow-up.

## 4. Publish and verify

- Publish to heytlcleaning.com.
- Check every route loads cleanly on the live site: home, services, the three residential service pages, commercial, service area, the five new city pages, booking (including the calendar), quote, about, FAQ, careers, contact, privacy, terms, and the private sign-in and dashboard.
- Check on desktop and phone widths, in English and Spanish, light and dark, with no browser errors.

## Technical notes

- New `service_cities` table (name, slug, latitude, longitude, is_active, sort_order) with grants, RLS: public read of active rows via a narrow anon select policy, admin-only writes through `private.has_role`. Seeded with the existing 15 cities in the same migration.
- `src/config/business.ts` keeps its city list as the build-time fallback; the explorer and service-area page read live rows through a public server function so the site never breaks if the table is empty.
- Dashboard additions go into `src/lib/admin.functions.ts` (city CRUD, demand aggregation) and new tabs in `src/routes/admin.tsx`, reusing `AdminTable` and the existing `requireAdmin` check.
- City pages are static route files using `seo()` plus a shared `CityPage` component; no per-city database dependency.
- Structured data extends the existing JSON-LD in `src/routes/__root.tsx` with `areaServed`; no `aggregateRating` until real reviews exist.

## Still blocked, unchanged

- Email delivery to tlcllc26@gmail.com: needs the email domain set up.
- Stripe and paid bookings: waiting on your authorization.
- Cancellation, refund and deposit policy text: waiting on your wording.
- Google sign-in for the dashboard: needs Google credentials added in your backend auth settings. Email and password sign-in works today.
