CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  service_type TEXT,
  arrival_window TEXT,
  reason TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT availability_blocks_dates CHECK (end_date >= start_date),
  CONSTRAINT availability_blocks_service CHECK (service_type IS NULL OR service_type IN ('standard', 'deep', 'move')),
  CONSTRAINT availability_blocks_window CHECK (arrival_window IS NULL OR arrival_window IN ('morning', 'midday', 'afternoon'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_blocks TO authenticated;
GRANT ALL ON public.availability_blocks TO service_role;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage availability blocks"
ON public.availability_blocks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());

ALTER TABLE public.booking_holds
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN expires_at SET DEFAULT 'infinity'::timestamptz,
  ADD COLUMN private_notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE public.booking_holds SET status = 'pending', expires_at = 'infinity'::timestamptz WHERE status = 'awaiting_payment';

ALTER TABLE public.quote_requests
  ADD COLUMN status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN private_notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.career_applications
  ADD COLUMN status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN private_notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.booking_holds ADD CONSTRAINT booking_holds_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_status_check CHECK (status IN ('new', 'reviewing', 'contacted', 'closed'));
ALTER TABLE public.career_applications ADD CONSTRAINT career_applications_status_check CHECK (status IN ('new', 'reviewing', 'contacted', 'closed'));

GRANT SELECT, UPDATE, DELETE ON public.booking_holds TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.career_applications TO authenticated;

CREATE POLICY "Admins manage booking requests" ON public.booking_holds FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage quote requests" ON public.quote_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage career applications" ON public.career_applications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER booking_holds_updated_at BEFORE UPDATE ON public.booking_holds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER career_applications_updated_at BEFORE UPDATE ON public.career_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER availability_blocks_updated_at BEFORE UPDATE ON public.availability_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX availability_blocks_lookup_idx ON public.availability_blocks (start_date, end_date, service_type, arrival_window);
CREATE INDEX booking_holds_admin_idx ON public.booking_holds (status, service_date, created_at DESC);
CREATE INDEX quote_requests_admin_idx ON public.quote_requests (status, created_at DESC);
CREATE INDEX career_applications_admin_idx ON public.career_applications (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.create_booking_request(
  p_booking_reference TEXT,
  p_service_type TEXT,
  p_frequency TEXT,
  p_service_date DATE,
  p_arrival_window TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_service_address TEXT,
  p_city TEXT,
  p_zip TEXT,
  p_estimate_cents INTEGER,
  p_request_payload JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  new_id UUID;
BEGIN
  IF p_service_type NOT IN ('standard', 'deep', 'move') THEN RAISE EXCEPTION 'Invalid service'; END IF;
  IF p_frequency NOT IN ('onetime', 'weekly', 'biweekly', 'monthly') OR (p_service_type <> 'standard' AND p_frequency <> 'onetime') THEN RAISE EXCEPTION 'Invalid frequency'; END IF;
  IF EXTRACT(ISODOW FROM p_service_date) > 5 OR p_service_date < CURRENT_DATE THEN RAISE EXCEPTION 'Selected date is unavailable'; END IF;
  IF p_arrival_window NOT IN ('morning', 'midday', 'afternoon') THEN RAISE EXCEPTION 'Selected window is unavailable'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.availability_blocks
    WHERE p_service_date BETWEEN start_date AND end_date
      AND (service_type IS NULL OR service_type = p_service_type)
      AND (arrival_window IS NULL OR arrival_window = p_arrival_window)
  ) THEN RAISE EXCEPTION 'Selected window is blocked'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_service_date::text || ':' || p_service_type || ':' || p_arrival_window));
  SELECT
    (SELECT count(*) FROM public.booking_holds WHERE service_date = p_service_date AND service_type = p_service_type AND arrival_window = p_arrival_window AND status IN ('pending', 'confirmed')) +
    (SELECT count(*) FROM public.bookings WHERE service_date = p_service_date AND service_type = p_service_type AND arrival_window = p_arrival_window AND payment_status = 'paid')
  INTO current_count;
  IF current_count >= 5 THEN RAISE EXCEPTION 'Selected window is full'; END IF;

  INSERT INTO public.booking_holds (
    booking_reference, service_type, frequency, service_date, arrival_window,
    customer_name, customer_email, customer_phone, service_address, city, zip,
    estimate_cents, request_payload, status, expires_at
  ) VALUES (
    p_booking_reference, p_service_type, p_frequency, p_service_date, p_arrival_window,
    p_customer_name, p_customer_email, p_customer_phone, p_service_address, p_city, p_zip,
    p_estimate_cents, p_request_payload, 'pending', 'infinity'::timestamptz
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_booking_request(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_request(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, JSONB) TO service_role;