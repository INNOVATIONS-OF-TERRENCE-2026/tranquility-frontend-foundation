CREATE TABLE public.giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_month DATE NOT NULL,
  entrant_name TEXT NOT NULL,
  entrant_email TEXT NOT NULL,
  entrant_phone TEXT NOT NULL,
  entry_for TEXT NOT NULL CHECK (entry_for IN ('self', 'someone_else')),
  nominee_name TEXT,
  nominee_relationship TEXT,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  need_category TEXT NOT NULL,
  story TEXT NOT NULL,
  marketing_email_opt_in BOOLEAN NOT NULL DEFAULT false,
  marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  consent_version TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'selected', 'contacted', 'scheduled', 'completed', 'ineligible', 'declined')),
  private_notes TEXT,
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (giveaway_month, entrant_email),
  UNIQUE (giveaway_month, entrant_phone)
);

GRANT ALL ON public.giveaway_entries TO service_role;
GRANT SELECT, UPDATE ON public.giveaway_entries TO authenticated;

ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read giveaway entries"
ON public.giveaway_entries FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update giveaway entries"
ON public.giveaway_entries FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE INDEX giveaway_entries_month_idx ON public.giveaway_entries (giveaway_month, created_at DESC);

CREATE TABLE public.marketing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_entity_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  contact_value TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'opt_in' CHECK (action IN ('opt_in', 'opt_out')),
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  source_url TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.marketing_consents TO service_role;
GRANT SELECT ON public.marketing_consents TO authenticated;

ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read marketing consents"
ON public.marketing_consents FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE INDEX marketing_consents_source_idx ON public.marketing_consents (source_type, created_at DESC);

CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(p_month DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner UUID;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT id INTO v_winner
  FROM public.giveaway_entries
  WHERE giveaway_month = p_month
    AND status IN ('new', 'contacted')
  ORDER BY random()
  LIMIT 1
  FOR UPDATE;

  IF v_winner IS NULL THEN
    RAISE EXCEPTION 'No eligible entries for this month';
  END IF;

  UPDATE public.giveaway_entries
  SET status = 'selected', selected_at = now(), updated_at = now()
  WHERE id = v_winner;

  RETURN v_winner;
END;
$$;

REVOKE ALL ON FUNCTION public.pick_giveaway_winner(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(DATE) TO authenticated;