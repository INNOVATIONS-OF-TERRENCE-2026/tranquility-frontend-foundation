CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(p_month DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
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
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(DATE) TO authenticated;
