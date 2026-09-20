ALTER TABLE public.contact_inquiries
  ADD COLUMN status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN private_notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD CONSTRAINT contact_inquiries_status_check CHECK (status IN ('new', 'reviewing', 'contacted', 'closed'));
GRANT SELECT, UPDATE, DELETE ON public.contact_inquiries TO authenticated;
CREATE POLICY "Admins manage contact inquiries" ON public.contact_inquiries FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX contact_inquiries_admin_idx ON public.contact_inquiries (status, created_at DESC);