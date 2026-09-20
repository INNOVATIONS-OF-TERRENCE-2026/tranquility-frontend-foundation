CREATE OR REPLACE FUNCTION public.consume_submission_attempt(
  p_kind TEXT,
  p_fingerprint_hash TEXT,
  p_limit INTEGER DEFAULT 6,
  p_window INTERVAL DEFAULT interval '15 minutes'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN private.consume_submission_attempt(p_kind, p_fingerprint_hash, p_limit, p_window);
END;
$$;
REVOKE ALL ON FUNCTION public.consume_submission_attempt(TEXT, TEXT, INTEGER, INTERVAL)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_submission_attempt(TEXT, TEXT, INTEGER, INTERVAL)
  TO service_role;
