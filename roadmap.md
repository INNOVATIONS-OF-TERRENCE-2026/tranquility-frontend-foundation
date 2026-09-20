# Roadmap

## Done
- Owner dashboard: overview (today, next 7 days, demand by city), search, service-area tab with city add/edit/hide/remove
- Booking calendar wired to real availability (capacity 5 per service/window, weekday-only, owner blocks); bookings save as leads with date, window, service, estimate, reference
- Backend: contact, careers, quote, booking save directly to the database (edge functions removed); quote photo upload route with token validation
- Local search: 5 city pages (Euless, Bedford, Hurst, Colleyville, Grapevine), sitemap, Euless mentions, live 19-city service-area data
- Warm porcelain redesign across all routes; bilingual + light/dark preserved; all 32 palettes intact
- Full QA: 22 routes 200, forms end-to-end with references, ES + dark + mobile, zero console errors

## Blocked on you
- Google OAuth: add client ID/secret in Lovable Cloud Auth settings, then owner sign-in with Google works
- Email delivery to tlcllc26@gmail.com: set up the email domain; until then submissions are stored privately with references, no email is sent
- Stripe payments: not authorized; no payment collected anywhere
- Cancellation/refund/deposit policy: needs your wording before it appears on the site
- Reviews/citations: set up Google Business Profile for Euless, then Bing Places, Apple Business Connect, Yelp, Nextdoor with identical name/phone/service area

## Open follow-ups
- Stale pending booking holds never expire (expires_at = infinity); add expiry sweep
- Move capacity 5 into an editable setting
- Restrict direct sign-ups at the provider level once owner account exists
- ColorStudio navy token does not adapt to warm palette; about page has two dark regions in light mode
