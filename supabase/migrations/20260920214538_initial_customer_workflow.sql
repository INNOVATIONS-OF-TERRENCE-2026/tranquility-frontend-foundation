CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date DATE,
  notes TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.contact_inquiries TO service_role;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  reliable_transportation BOOLEAN NOT NULL,
  experience TEXT NOT NULL,
  availability TEXT NOT NULL,
  additional_information TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.career_applications TO service_role;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  approximate_size TEXT,
  scope TEXT NOT NULL,
  desired_timing TEXT,
  contact_preference TEXT NOT NULL,
  notes TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.booking_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  service_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  service_date DATE NOT NULL,
  arrival_window TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  estimate_cents INTEGER NOT NULL,
  deposit_cents INTEGER NOT NULL DEFAULT 10000,
  request_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'awaiting_payment',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.booking_holds TO service_role;
ALTER TABLE public.booking_holds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  hold_id UUID UNIQUE REFERENCES public.booking_holds(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  service_date DATE NOT NULL,
  arrival_window TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  estimate_cents INTEGER NOT NULL,
  deposit_cents INTEGER NOT NULL DEFAULT 10000,
  payment_reference TEXT UNIQUE,
  payment_status TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX booking_holds_slot_idx ON public.booking_holds (service_date, arrival_window, status, expires_at);
CREATE INDEX bookings_slot_idx ON public.bookings (service_date, arrival_window, payment_status);
CREATE INDEX contact_inquiries_created_idx ON public.contact_inquiries (created_at DESC);
CREATE INDEX career_applications_created_idx ON public.career_applications (created_at DESC);
CREATE INDEX quote_requests_created_idx ON public.quote_requests (created_at DESC);

CREATE OR REPLACE FUNCTION public.reserve_booking_hold(
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
  IF EXTRACT(ISODOW FROM p_service_date) > 5 OR p_service_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Selected date is unavailable';
  END IF;
  IF p_arrival_window NOT IN ('morning', 'midday', 'afternoon') THEN
    RAISE EXCEPTION 'Selected window is unavailable';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(p_service_date::text || ':' || p_arrival_window));
  SELECT
    (SELECT count(*) FROM public.bookings WHERE service_date = p_service_date AND arrival_window = p_arrival_window AND payment_status = 'paid') +
    (SELECT count(*) FROM public.booking_holds WHERE service_date = p_service_date AND arrival_window = p_arrival_window AND status = 'awaiting_payment' AND expires_at > now())
  INTO current_count;
  IF current_count >= 5 THEN
    RAISE EXCEPTION 'Selected window is full';
  END IF;
  INSERT INTO public.booking_holds (
    booking_reference, service_type, frequency, service_date, arrival_window,
    customer_name, customer_email, customer_phone, service_address, city, zip,
    estimate_cents, request_payload
  ) VALUES (
    p_booking_reference, p_service_type, p_frequency, p_service_date, p_arrival_window,
    p_customer_name, p_customer_email, p_customer_phone, p_service_address, p_city, p_zip,
    p_estimate_cents, p_request_payload
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_booking_hold(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_booking_hold(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, JSONB) TO service_role;