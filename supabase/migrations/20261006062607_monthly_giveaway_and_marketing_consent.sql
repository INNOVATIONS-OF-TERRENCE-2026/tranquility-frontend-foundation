ALTER TABLE public.submission_attempts
  DROP CONSTRAINT IF EXISTS submission_attempts_kind_check;
ALTER TABLE public.submission_attempts
  ADD CONSTRAINT submission_attempts_kind_check
  CHECK (kind IN ('contact','career','quote','booking','media','giveaway'));

CREATE TABLE public.giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_month DATE NOT NULL,
  entrant_name TEXT NOT NULL,
  entrant_email TEXT NOT NULL,
  entrant_phone TEXT NOT NULL,
  entry_for TEXT NOT NULL DEFAULT 'self',
  nominee_name TEXT,
  nominee_relationship TEXT,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  need_category TEXT NOT NULL,
  story TEXT NOT NULL,
  marketing_email_opt_in BOOLEAN NOT NULL DEFAULT false,
  marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  consent_version TEXT NOT NULL DEFAULT 'giveaway-2026-10-v1',
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'new',
  selected_at TIMESTAMPTZ,
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT giveaway_month_first_day_check CHECK (giveaway_month = date_trunc('month', giveaway_month)::date),
  CONSTRAINT giveaway_entry_for_check CHECK (entry_for IN ('self','someone_else')),
  CONSTRAINT giveaway_need_category_check CHECK (need_category IN (
    'postpartum','mental_health_clutter','recovery','disability_support','veteran_support','other'
  )),
  CONSTRAINT giveaway_language_check CHECK (language IN ('en','es')),
  CONSTRAINT giveaway_status_check CHECK (status IN (
    'new','selected','contacted','scheduled','completed','ineligible','declined'
  )),
  CONSTRAINT giveaway_nominee_check CHECK (
    entry_for = 'self' OR nullif(trim(nominee_name), '') IS NOT NULL
  )
);

CREATE UNIQUE INDEX giveaway_entries_month_email_unique
  ON public.giveaway_entries (giveaway_month, lower(entrant_email));
CREATE UNIQUE INDEX giveaway_entries_month_phone_unique
  ON public.giveaway_entries (giveaway_month, entrant_phone);
CREATE INDEX giveaway_entries_month_status_idx
  ON public.giveaway_entries (giveaway_month DESC, status, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.giveaway_entries TO authenticated;
GRANT ALL ON public.giveaway_entries TO service_role;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified owner manages giveaway entries"
ON public.giveaway_entries FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

CREATE TRIGGER giveaway_entries_updated_at
BEFORE UPDATE ON public.giveaway_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER audit_giveaway_entries
AFTER UPDATE OR DELETE ON public.giveaway_entries
FOR EACH ROW EXECUTE FUNCTION private.audit_owner_mutation();

CREATE TABLE public.marketing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_entity_id UUID,
  channel TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'opt_in',
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketing_consents_source_check CHECK (source_type IN ('giveaway')),
  CONSTRAINT marketing_consents_channel_check CHECK (channel IN ('email','sms')),
  CONSTRAINT marketing_consents_action_check CHECK (action IN ('opt_in','opt_out'))
);

CREATE INDEX marketing_consents_contact_idx
  ON public.marketing_consents (channel, lower(contact_value), created_at DESC);
CREATE INDEX marketing_consents_source_idx
  ON public.marketing_consents (source_type, source_entity_id, created_at DESC);

GRANT SELECT ON public.marketing_consents TO authenticated;
GRANT ALL ON public.marketing_consents TO service_role;
ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified owner reads marketing consents"
ON public.marketing_consents FOR SELECT TO authenticated
USING ((select private.is_owner()));

CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(p_month DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  normalized_month DATE;
  winner_id UUID;
BEGIN
  IF NOT private.is_owner() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  normalized_month := date_trunc('month', p_month)::date;

  IF EXISTS (
    SELECT 1
    FROM public.giveaway_entries
    WHERE giveaway_month = normalized_month
      AND status IN ('selected','contacted','scheduled','completed')
  ) THEN
    RAISE EXCEPTION 'A winner has already been selected for this month';
  END IF;

  SELECT id INTO winner_id
  FROM public.giveaway_entries
  WHERE giveaway_month = normalized_month
    AND status = 'new'
  ORDER BY gen_random_uuid()
  LIMIT 1
  FOR UPDATE;

  IF winner_id IS NULL THEN
    RAISE EXCEPTION 'No eligible entries are available for this month';
  END IF;

  UPDATE public.giveaway_entries
  SET status = 'selected',
      selected_at = now()
  WHERE id = winner_id;

  RETURN winner_id;
END;
$$;

REVOKE ALL ON FUNCTION public.pick_giveaway_winner(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(DATE) TO authenticated, service_role;
