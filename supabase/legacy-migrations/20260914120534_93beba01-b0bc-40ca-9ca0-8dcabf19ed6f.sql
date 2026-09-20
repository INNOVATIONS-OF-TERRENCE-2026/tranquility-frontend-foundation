ALTER EXTENSION btree_gist SET SCHEMA extensions;

CREATE POLICY "Public access denied" ON public.contact_inquiries FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Public access denied" ON public.career_applications FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Public access denied" ON public.quote_requests FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Public access denied" ON public.booking_holds FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Public access denied" ON public.bookings FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);