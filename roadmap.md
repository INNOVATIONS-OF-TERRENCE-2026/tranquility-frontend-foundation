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


## Lucy Intelligence
- Sitewide Lucy Intelligence concierge mounted at the application root for all public routes, with the auth page excluded
- Route-aware English and Spanish prompt suggestions, premium mobile bottom-sheet UX, desktop floating concierge, keyboard support, session-only conversation continuity, reset controls, and graceful failure states
- Tool-first pricing intelligence uses the existing `buildEstimate()` engine so Lucy never invents prices or discounts
- Live service-area checks use `service_cities` when available and fall back to verified project configuration during temporary database outages
- Lucy can compare services, generate verified estimates, route users to booking or custom quote flows, and safely prefill approved booking fields through validated query parameters
- Public Lucy cannot access customer records, owner notes, admin data, credentials, or service-role capabilities
- Owner Operations mode is protected by existing Supabase authentication plus the approved owner email and sends only aggregate operational summaries to the optional AI provider
- Public and owner conversations use separate `sessionStorage` scopes and are not written to Supabase by default
- Free-form intelligence uses the server-only `OPENAI_API_KEY` environment secret when configured. `LUCY_OPENAI_MODEL` is optional and defaults to `gpt-6-luna`
- If the AI provider is unavailable or not configured, deterministic pricing, service comparison, booking, quote, service-area, and owner-summary intelligence continue working
- No AI credential may be stored in `VITE_` variables or committed to source control
