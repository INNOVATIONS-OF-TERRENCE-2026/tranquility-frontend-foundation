# Finish customer routes, forms, and navigation

## Outcome
Complete the customer-facing V1 so every requested destination is reachable, the inquiry form prepares a complete email to Tranquility, and service requests use one polished mobile-friendly form with a final review before email.

## Changes
- Update the sticky header and footer so Services, Service Area, About, FAQ, Contact, and Careers link directly to their existing routes on desktop and mobile.
- Complete Contact with validated name, phone, email, service type, preferred date, and notes fields; submission opens a fully addressed email draft to `tlcllc26@gmail.com`.
- Preserve and polish Careers, Privacy, and Terms as complete standalone pages, including working contact links and clear privacy wording for browser-prepared emails.
- Improve the global 404 experience with working recovery navigation while keeping the shared header and footer.
- Replace the six-step booking wizard with one responsive booking form organized into clear sections: service, frequency, home scope, add-ons, scheduling, and contact details.
- Keep the live estimate visible without crowding mobile screens, preserve all approved pricing and quantity rules, and validate required fields before review.
- Add a dedicated confirmation/review state where customers can verify every detail and estimated total before opening the final email draft.

## Technical details
- Reuse the existing TanStack routes, shared layout, pricing configuration, design tokens, and form controls; no duplicate router or data layer.
- Use Zod-backed validation and encoded `mailto:` output. No customer information is stored or silently sent.
- Keep route-specific metadata intact and verify every content route has complete metadata.
- Check desktop and mobile layouts, keyboard behavior, broken links, validation, pricing calculations, and generated email content.

## Assumption
“Emails us” means opening the customer’s email app with the recipient, subject, and form details prefilled, matching the requested confirmation-before-email flow. Automatic background sending would require a verified sending domain and a separate setup.
