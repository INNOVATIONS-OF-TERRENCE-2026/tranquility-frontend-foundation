# Official Logo Master Replacement

## Goal
Make the attached gold TL house monogram the single official Tranquility Level Cleaning brand image across the site without changing business logic, pricing, language behavior, routes, or service flows.

## Implementation
1. **Create one approved asset family**
   - Preserve the uploaded artwork exactly and retain its existing alpha transparency and dark bevel details.
   - Produce the master PNG, optimized WebP, 512, 256, 192, 180, 96, 64, 48, 32, and 16 pixel PNGs, plus `favicon.ico` when supported.
   - Use high-quality proportional downsampling with transparent padding where square icon safety requires it.

2. **Centralize brand references**
   - Add a typed brand asset configuration for the website logo, master image, app icons, and social image.
   - Replace all active legacy paths in the shared logo, homepage, About page, footer, root metadata, and structured data.
   - Remove obsolete logo files only after confirming no references remain.

3. **Refine visible placement**
   - Update desktop and mobile headers to show the same official logo uncropped with `object-contain`, stable dimensions, and no recoloring.
   - Keep the homepage service-area logo link using the approved artwork and accessible bilingual destination label.
   - Add the same official mark to the footer while keeping business and technology attribution visually separate.

4. **Update browser and discovery surfaces**
   - Wire 16px and 32px favicons, the optional ICO, and the 180px Apple touch icon.
   - Update the web manifest to the official 192px and 512px assets with safe `any` and maskable use.
   - Set the official master image as the canonical logo/image in structured data and as the Open Graph and Twitter image on every content route through the shared metadata helper.
   - Use the production domain `https://heytlcleaning.com` consistently.

5. **Audit and verify**
   - Search all source, public files, metadata, CSS, and JSON for old logo names and missing image paths.
   - Validate real alpha transparency and inspect the generated sizes for halos, clipping, distortion, and excessive compression.
   - Run the repository's formatting, lint, type, test/verification, and production checks available in the project.
   - Test the live preview at 320, 375, 390, 414, 768, 1024, 1280, 1440, and 1920 pixels, including header/footer visibility and browser console/network asset errors.

## Technical details
- The uploaded 1448×1086 RGBA image is the immutable visual source.
- Website assets remain transparent and gold; themes and all 32 palettes affect surrounding UI only.
- Repeated decorative instances use empty alternative text where nearby text already names the business; linked brand marks expose a clear destination name.
- Pricing, booking calculations, quote behavior, service rules, and English/Spanish architecture remain untouched.
