DROP POLICY IF EXISTS "Public access denied" ON public.contact_inquiries;
CREATE POLICY "Anonymous access denied" ON public.contact_inquiries
FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Public access denied" ON public.career_applications;
CREATE POLICY "Anonymous access denied" ON public.career_applications
FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Public access denied" ON public.quote_requests;
CREATE POLICY "Anonymous access denied" ON public.quote_requests
FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Public access denied" ON public.booking_holds;
CREATE POLICY "Anonymous access denied" ON public.booking_holds
FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Public access denied" ON public.bookings;
CREATE POLICY "Public access denied" ON public.bookings
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Verified owner manages availability blocks" ON public.availability_blocks;
CREATE POLICY "Verified owner manages availability blocks"
ON public.availability_blocks FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()) AND created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Verified owner manages booking requests" ON public.booking_holds;
CREATE POLICY "Verified owner manages booking requests"
ON public.booking_holds FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner manages quote requests" ON public.quote_requests;
CREATE POLICY "Verified owner manages quote requests"
ON public.quote_requests FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner manages career applications" ON public.career_applications;
CREATE POLICY "Verified owner manages career applications"
ON public.career_applications FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner manages contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Verified owner manages contact inquiries"
ON public.contact_inquiries FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner reads quote media" ON public.quote_media;
CREATE POLICY "Verified owner reads quote media"
ON public.quote_media FOR SELECT TO authenticated
USING ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner deletes quote media" ON public.quote_media;
CREATE POLICY "Verified owner deletes quote media"
ON public.quote_media FOR DELETE TO authenticated
USING ((select private.is_owner()));

DROP POLICY IF EXISTS "Verified owner reads audit logs" ON public.audit_logs;
CREATE POLICY "Verified owner reads audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING ((select private.is_owner()));

CREATE POLICY "Public access denied"
ON public.submission_attempts FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);
