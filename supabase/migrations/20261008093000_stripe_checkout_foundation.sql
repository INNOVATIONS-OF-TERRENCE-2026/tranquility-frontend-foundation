-- Additive, off-by-default Stripe Checkout infrastructure. Existing booking_holds are unchanged.
CREATE TABLE IF NOT EXISTS public.checkout_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  booking_reference text NOT NULL UNIQUE,
  service_type text NOT NULL CHECK (service_type IN ('standard','deep','move')),
  frequency text NOT NULL CHECK (frequency IN ('onetime','weekly','biweekly','monthly')),
  service_date date NOT NULL,
  arrival_window text NOT NULL CHECK (arrival_window IN ('morning','midday','afternoon')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service_address text NOT NULL,
  city text NOT NULL,
  zip text NOT NULL,
  estimate_cents integer NOT NULL CHECK (estimate_cents > 0),
  request_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'creating' CHECK (status IN
    ('creating','awaiting_payment','processing','paid','expired','cancelled','failed','payment_exception','refunded','disputed')),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  checkout_url text,
  expires_at timestamptz NOT NULL,
  paid_cents integer,
  tax_cents integer,
  refunded_cents integer NOT NULL DEFAULT 0,
  stripe_livemode boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS checkout_reservations_capacity_idx
  ON public.checkout_reservations(service_date,service_type,arrival_window,status,expires_at);
CREATE INDEX IF NOT EXISTS checkout_reservations_created_idx
  ON public.checkout_reservations(created_at DESC);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  stripe_event_id text PRIMARY KEY,
  event_type text NOT NULL,
  reservation_id uuid REFERENCES public.checkout_reservations(id),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checkout_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkout_reservations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.stripe_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.checkout_reservations TO service_role;
GRANT ALL ON public.stripe_webhook_events TO service_role;
CREATE POLICY "Administrators can inspect checkout reservations"
  ON public.checkout_reservations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Administrators can inspect Stripe event ledger"
  ON public.stripe_webhook_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.reserve_stripe_checkout(
  p_idempotency_key uuid, p_reference text, p_service_type text,
  p_frequency text, p_date date, p_window text,
  p_name text, p_email text, p_phone text, p_address text,
  p_city text, p_zip text, p_estimate_cents integer,
  p_payload jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_row public.checkout_reservations%ROWTYPE;
  v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_date::text || ':' || p_service_type || ':' || p_window));

  SELECT * INTO v_row FROM public.checkout_reservations
   WHERE idempotency_key = p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF v_row.service_type <> p_service_type OR v_row.service_date <> p_date
       OR v_row.arrival_window <> p_window OR v_row.estimate_cents <> p_estimate_cents
       OR v_row.customer_email <> lower(p_email)
       OR v_row.request_payload <> p_payload
       OR v_row.status NOT IN ('creating','awaiting_payment','processing') THEN
      RAISE EXCEPTION 'CHECKOUT_KEY_CONFLICT';
    END IF;
    RETURN v_row.id;
  END IF;
  IF p_service_type NOT IN ('standard','deep','move')
    OR (p_service_type <> 'standard' AND p_frequency <> 'onetime')
    OR p_frequency NOT IN ('onetime','weekly','biweekly','monthly')
    OR p_window NOT IN ('morning','midday','afternoon')
    OR extract(isodow FROM p_date) > 5
    OR p_date < (now() AT TIME ZONE 'America/Chicago')::date
    OR p_estimate_cents < 1 THEN
    RAISE EXCEPTION 'INVALID_CHECKOUT_REQUEST';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.service_cities
      WHERE lower(name) = lower(p_city) AND is_active
  ) THEN RAISE EXCEPTION 'UNSUPPORTED_SERVICE_CITY'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.availability_blocks
     WHERE p_date BETWEEN start_date AND end_date
       AND (service_type IS NULL OR service_type = p_service_type)
       AND (arrival_window IS NULL OR arrival_window = p_window)
  ) THEN RAISE EXCEPTION 'SLOT_UNAVAILABLE'; END IF;
  SELECT
    (SELECT count(*) FROM public.booking_holds
      WHERE service_date=p_date AND service_type=p_service_type AND arrival_window=p_window
      AND status IN ('pending','confirmed'))
    + (SELECT count(*) FROM public.bookings
      WHERE service_date=p_date AND service_type=p_service_type AND arrival_window=p_window
      AND payment_status='paid')
    + (SELECT count(*) FROM public.checkout_reservations
      WHERE service_date=p_date AND service_type=p_service_type AND arrival_window=p_window
      AND status IN ('creating','awaiting_payment','processing','payment_exception'))
    INTO v_count;
  IF v_count >= 5 THEN RAISE EXCEPTION 'SLOT_UNAVAILABLE'; END IF;

  INSERT INTO public.checkout_reservations (
    idempotency_key,booking_reference,service_type,frequency,
    service_date,arrival_window,customer_name,customer_email,customer_phone,
    service_address,city,zip,estimate_cents,request_payload,expires_at
  ) VALUES (
    p_idempotency_key,p_reference,p_service_type,p_frequency,p_date,p_window,
    p_name,lower(p_email),p_phone,p_address,p_city,p_zip,p_estimate_cents,p_payload,
    now() + interval '31 minutes'
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.apply_stripe_checkout_event(
  p_event_id text, p_type text, p_reservation_id uuid, p_session_id text,
  p_payment_intent text, p_subtotal_cents integer, p_total_cents integer,
  p_tax_cents integer, p_currency text, p_livemode boolean
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public AS $$
DECLARE
  v_res public.checkout_reservations%ROWTYPE;
  v_payment_status text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_reservation_id::text));
  IF EXISTS (SELECT 1 FROM public.stripe_webhook_events WHERE stripe_event_id=p_event_id) THEN
    RETURN 'already_processed';
  END IF;
  SELECT * INTO v_res FROM public.checkout_reservations
    WHERE id=p_reservation_id FOR UPDATE;
  IF NOT FOUND OR (v_res.stripe_session_id IS NOT NULL AND v_res.stripe_session_id <> p_session_id)
      OR p_currency <> 'usd' THEN RAISE EXCEPTION 'PAYMENT_RECONCILIATION_FAILED'; END IF;
  IF p_type IN ('checkout.session.completed','checkout.session.async_payment_succeeded') THEN
    IF p_type = 'checkout.session.completed' AND p_payment_intent IS NULL THEN
      v_payment_status := 'processing';
    ELSE
      v_payment_status := 'paid';
    END IF;
    IF v_payment_status = 'paid' THEN
      IF p_subtotal_cents <> v_res.estimate_cents
         OR p_total_cents < p_subtotal_cents
         OR p_tax_cents <> p_total_cents - p_subtotal_cents
         OR p_payment_intent IS NULL THEN
        RAISE EXCEPTION 'PAYMENT_AMOUNT_MISMATCH';
      END IF;
      INSERT INTO public.bookings (
        booking_reference,service_type,frequency,service_date,arrival_window,
        customer_name,customer_email,customer_phone,service_address,city,zip,
        estimate_cents,deposit_cents,payment_reference,payment_status,request_payload
      ) VALUES (
        v_res.booking_reference,v_res.service_type,v_res.frequency,
        v_res.service_date,v_res.arrival_window,v_res.customer_name,v_res.customer_email,
        v_res.customer_phone,v_res.service_address,v_res.city,v_res.zip,
        v_res.estimate_cents,p_total_cents,p_payment_intent,'paid',v_res.request_payload
      ) ON CONFLICT (booking_reference) DO NOTHING;
    END IF;
    UPDATE public.checkout_reservations SET
      status=CASE WHEN status='paid' THEN status ELSE v_payment_status END,
      stripe_session_id=p_session_id,
      stripe_payment_intent_id=coalesce(p_payment_intent,stripe_payment_intent_id),
      paid_cents=CASE WHEN v_payment_status='paid' THEN p_total_cents ELSE paid_cents END,
      tax_cents=CASE WHEN v_payment_status='paid' THEN p_tax_cents ELSE tax_cents END,
      stripe_livemode=p_livemode,updated_at=now()
      WHERE id=p_reservation_id;
  ELSIF p_type IN ('checkout.session.expired','checkout.session.async_payment_failed') THEN
    IF v_res.status NOT IN ('paid','refunded','disputed') THEN
      UPDATE public.checkout_reservations SET
        status=CASE WHEN p_type='checkout.session.expired' THEN 'expired' ELSE 'failed' END,
        updated_at=now() WHERE id=p_reservation_id;
    END IF;
  END IF;
  INSERT INTO public.stripe_webhook_events(stripe_event_id,event_type,reservation_id)
  VALUES(p_event_id,p_type,p_reservation_id);
  RETURN 'processed';
END $$;

REVOKE ALL ON FUNCTION public.reserve_stripe_checkout(
uuid,text,text,text,date,text,text,text,text,text,text,text,integer,jsonb
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_stripe_checkout(
uuid,text,text,text,date,text,text,text,text,text,text,text,integer,jsonb
) TO service_role;
REVOKE ALL ON FUNCTION public.apply_stripe_checkout_event(
text,text,uuid,text,text,integer,integer,integer,text,boolean
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_checkout_event(
text,text,uuid,text,text,integer,integer,integer,text,boolean
) TO service_role;
