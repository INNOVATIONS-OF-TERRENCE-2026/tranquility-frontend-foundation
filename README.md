# Tranquility Frontend Foundation

Build a production-grade premium customer-facing web application for Tranquility Level Cleaning / Tranquility Cleaning serving Dallas-Fort Worth. This is not a generic cleaning template. Treat this as the authoritative V1 product foundation and execute the full frontend experience now.

PRIMARY PRODUCT GOAL
Create a calm, premium, highly polished cleaning-service web app that lets customers understand services, see approved pricing, select service type and frequency, configure scope/add-ons, request service, request a custom quote/virtual consultation, contact the company, read FAQs, learn about the company, and apply for careers. It must feel sophisticated, trustworthy, modern, simple, and intentionally designed for a real service business.

DO NOT ENABLE SUPABASE, LOVABLE CLOUD DATABASE, STRIPE, PAYMENT PROCESSING, AUTH, OR ANY BACKEND FOR V1. Do not fake successful database submissions. Forms may create validated client-side summaries and use mailto/tel/contact actions until backend is explicitly authorized later.

BUSINESS CONTACT
Business name: Tranquility Level Cleaning (brand may display as Tranquility Cleaning where cleaner visually)
Tagline: Come home to tranquility.
Phone: (945) 402-3260
Phone href: tel:+19454023260
Email: tlcllc26@gmail.com
Service area: Dallas-Fort Worth and surrounding communities
Core cities: Dallas, Fort Worth, Arlington, Plano, Irving, Garland, Frisco, McKinney, Grand Prairie, Denton, Mesquite, Carrollton, Lewisville, Richardson.

BRAND / VISUAL SYSTEM
Use a premium, serene palette: warm ivory, soft stone, muted sage/moss, taupe, natural oak tones, charcoal. Avoid black-heavy layouts, loud gradients, childish colors, neon, cheap cleaning clipart, generic stock maid imagery, generic AI people, sparkly gimmicks, excessive glassmorphism, excessive animation, autoplay video, or template-looking SaaS sections. No people imagery unless user later supplies real approved brand assets. Prefer texture, subtle architectural/interior detail photography, or fully designed typography/layout with tasteful abstract/home detail visuals. Typography must feel elevated and editorial but extremely readable. Mobile-first. Excellent spacing, hierarchy, contrast, focus states, large tap targets, accessible labels, semantic HTML.

ROUTES TO BUILD
/
/services
/residential-cleaning
/deep-cleaning
/move-in-move-out-cleaning
/commercial-cleaning
/service-area
/booking
/quote
/about
/faq
/careers
/contact
/privacy
/terms
404 fallback

HEADER / NAVIGATION
Sticky refined header. Primary nav: Services, Service Area, About, FAQ, Contact. Strong actions: Get a Quote and Request Service. Mobile menu must be excellent, close on route changes, support Escape, and never cover content awkwardly. Add a subtle top utility strip only if it improves the design, showing DFW service area and phone.

HOME PAGE
Hero: premium, calm, emotionally resonant. Lead with “Come home to tranquility.” Supporting copy should communicate professional cleaning designed to make the home feel lighter and easier to live in. Strong CTA pair: Request Service / Get a Custom Quote. Include service overview, why choose Tranquility, how it works, recurring-cleaning savings, virtual consultation, service-area coverage, FAQs preview, and final CTA. Do not invent testimonials, star ratings, number of customers, insurance/bonding claims, guarantees, years in business, certifications, or statistics.

SERVICES
Residential Cleaning
Deep Cleaning
Move-In / Move-Out Cleaning
Commercial / Office Cleaning
Commercial must always route to custom quote / consultation, not instant residential pricing.

APPROVED BASE PRICING — DO NOT CHANGE OR INVENT
Base pricing assumes a standard average 1-bedroom / 1-full-bath home.
Standard Clean: $145 one-time
Deep Clean: $215 one-time
Move-In/Move-Out Clean: $235 one-time

Recurring frequency discounts apply ONLY to the service subtotal, not add-ons:
Weekly: 20% savings
Bi-weekly: 15% savings
Monthly: 10% savings
One-time: no discount

Display rounded prices for the selected cleaning type:
Standard: One-time $145, Weekly $116, Bi-weekly $123, Monthly $131
Deep: One-time $215, Weekly $172, Bi-weekly $183, Monthly $194
Move-In/Out: One-time $235, Weekly $188, Bi-weekly $200, Monthly $212

PRICING UX RULE
Do NOT use a broken-down square-footage formula as the primary pricing engine. Treva specifically does not want customers mathematically priced as square footage + bedrooms + bathrooms. Show the base price for a standard average home, then add only approved add-ons/customizations. Square footage, layout, condition, unusual scope, and specialty needs are review/context inputs that can cause a custom quote. If scope is clearly atypical or complex, route the user toward a custom consultation rather than pretending the automated estimate is final.

CUSTOM PROPERTY EXAMPLE
A 3,000-square-foot 4-bedroom / 4-bath home where the customer wants only 1 bedroom and 2 bathrooms cleaned is custom scope and should be presented as consultation/custom-quote territory instead of a standard automated booking calculation. Treat 3,000 sq ft and above as a custom-review trigger for this V1 unless later changed by business owner.

APPROVED ADD-ON MATRIX
Prices vary by selected service where stated. Build this as reusable configuration data, not scattered hardcoded strings.
Additional bedroom: Standard +$15 / Deep +$27 / Move +$37
Laundry wash/dry/fold: +$20 per load across services
Laundry fold only: +$13 per load across services
Laundry/Utility Room: Standard +$10 / Deep +$17 / Move +$22
Additional full bathroom: Standard starting at +$17 / Deep starting at +$29 / Move starting at +$39
Half bathroom: Standard +$13 / Deep +$25 / Move +$37
Additional Living Room: +$15 across services
Dining Room: +$15 across services
Office: +$12 across services
Excess dishes: +$25
Oven Interior: +$40
Fridge Interior: +$25
Above Stove hood/vents: starting at $45
Cabinet Interior: +$35
Excess Pet Hair Vacuuming: +$15
Baseboards: starting at $25
Garage/Patio: +$35
Carpet Spot Cleaning: starting at +$35

IMPORTANT QUANTITY LOGIC
Do not make quantity-sensitive services simple yes/no checkboxes when that would be inaccurate. Additional bedrooms, additional full baths, half baths, living rooms, laundry loads, etc. need sensible quantity controls. Avoid double charging by deriving room-related surcharges from entered counts where possible or clearly separating scope inputs from optional extras. Base includes 1 bedroom and 1 full bathroom; additional-room calculations must reflect that baseline. Laundry wash/dry/fold and fold-only need quantity per load. “Starting at” items must be labeled clearly and may require review.

BOOKING / SERVICE REQUEST EXPERIENCE
Build a refined guided multi-step experience, concise and mobile-friendly:
1. Cleaning type
2. Frequency
3. Home/profile and scope
4. Add-ons
5. Schedule/contact
6. Review

Cleaning type cards: Standard, Deep, Move-In/Move-Out with approved starting/base price.
Frequency cards: One-time, Weekly 20% savings, Bi-weekly 15%, Monthly 10%, and dynamically show the selected service price.
Collect approximate square footage for review only, not direct arithmetic pricing. Collect bedroom/full-bath/half-bath counts and relevant room information with clean controls. Base state 1 bedroom / 1 full bath.
Pets: yes/no plus details. Policy copy: pets may remain if they are not a distraction or hindrance; anxious, aggressive, or disruptive animals should be safely secured.
Other/special spaces: allow description.
Condition/service notes: free text.
Contact: full name, email, phone, physical address, city, ZIP.
Scheduling: preferred date plus general preferred arrival window. Do not claim guaranteed appointment availability. Validate no past dates.
Review screen must summarize service, frequency, scope, add-ons, estimated/base pricing, discount, and any custom-review flags.
Clearly disclose: pricing is based on an average/standard home and can change based on square footage, customizations, condition, layout, unusual scope, or specialty work. Final service details may require confirmation.
Do not collect card/payment information in V1.

QUOTE / VIRTUAL CONSULTATION
Create a dedicated premium quote experience for unusual homes, commercial work, large/custom properties, specialty scope, or customers wanting a virtual consultation.
Collect: residential/commercial/specialty selection, property/contact profile, approximate size, scope/condition, desired timing, contact preference, notes.
Support local image selection UI for interior photos with previews and removal, but do not falsely imply files were uploaded to a server. Explain that selected files remain local in this V1 and the customer can request a secure submission method. Privacy note: do not include IDs, financial documents, or sensitive personal information in photos.
Strong direct call/email fallback.

CAREERS
Build a premium redesigned Careers / Join Our Team page. Preserve the business information flow Treva likes, but make the design substantially more sophisticated than a generic form page.
Fields:
Full name
Email
Phone
City
Reliable transportation yes/no
Cleaning experience
General availability
Optional additional information
Do not collect SSN, banking info, ID images, or other sensitive onboarding documents on this public page.
Because there is no backend yet, validate client-side and compose a structured email to tlcllc26@gmail.com rather than pretending an application was submitted to a database. State this naturally.

ABOUT
Position the company as thoughtful, respectful, detail-oriented professional cleaning designed to make the home feel lighter. Emphasize clear expectations, respect for the customer’s space, consistency, calmer experience, and thoughtful handling of pets/layout/special conditions. Do not invent founder biography or claims not supplied.

FAQ CONTENT TO COVER
What determines pricing?
Why can final price change?
What are recurring-service savings?
What happens with large/custom homes?
Can I request only part of my home?
What about pets?
Do you provide supplies/equipment?
Can I use my own/non-toxic products by request?
What if I’m not home?
How do cancellations/rescheduling work? Use “contact us as early as possible” unless exact policy is supplied; do not invent fees.
What add-ons are available?
How does a virtual consultation work?
Do you clean offices/commercial spaces?
Do you require a contract? Do not invent contractual policy; explain recurring service can be discussed during confirmation.
Is tipping required? State optional only if presented as a general courtesy, not a mandatory business policy.

CONTACT
Professional cards/actions for Call, Email, Service Area. Add clear pathways to residential service request and custom quote. General inquiry form can validate and generate a prefilled email because no backend exists.

SERVICE AREA
Dedicated DFW service-area page. Show listed cities cleanly and explain surrounding communities may be considered. No unsupported mileage radius or travel fee claims.

SEO / APP POLISH
Per-route title and meta description. Canonical URL structure prepared for a future custom domain. Open Graph/Twitter metadata. JSON-LD CleaningService schema only with supplied factual data. robots.txt, sitemap, manifest/favicon placeholders. Route change scroll-to-top. Accessible skip link. Proper 404. Respect prefers-reduced-motion. No layout shifts from decorative effects.

TECHNICAL QUALITY
Use clean React + TypeScript architecture with reusable components/config. Keep pricing configuration centralized and typed. Use validation for forms. No duplicated pricing constants. No dead code. No fake API calls. No localStorage persistence of sensitive info. No service-role keys. No backend secrets. No Supabase or Stripe packages unless already required by template; remove unused backend integrations from the customer flow. Keep code easy to connect to a backend later.

NON-NEGOTIABLE RULES
Do not invent business facts.
Do not invent pricing.
Do not invent testimonials/reviews.
Do not invent staff photos or founder story.
Do not use generic AI people.
Do not overcomplicate the experience.
Do not hide key pricing behind a form.
Do not make commercial service look like instant residential checkout.
Do not enable payment or backend systems yet.
Do not claim a form was stored/sent when it was not.
Do not sacrifice mobile quality.
Do not stop at a single landing page. Build all routes and flows listed above.

DELIVERY STANDARD
Implement the complete frontend application in this project, not just a design plan. Ensure internal navigation works, pricing logic is internally consistent, forms validate, mobile layouts are polished, and all routes render. After implementation, audit the experience for visual consistency, accessibility, pricing correctness, quantity logic, copy accuracy, and broken links before declaring completion.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/585c89e8-eac0-47b8-a81e-af86a2afff7f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
