CREATE OR REPLACE FUNCTION private.consume_submission_attempt(
  p_kind TEXT,
  p_fingerprint_hash TEXT,
  p_limit INTEGER DEFAULT 6,
  p_window INTERVAL DEFAULT interval '15 minutes'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  IF p_kind NOT IN ('contact','career','quote','booking','media','giveaway') THEN
    RETURN false;
  END IF;

  DELETE FROM public.submission_attempts
  WHERE created_at < now() - interval '48 hours';

  SELECT count(*) INTO recent_count
  FROM public.submission_attempts
  WHERE kind = p_kind
    AND fingerprint_hash = p_fingerprint_hash
    AND created_at >= now() - p_window;

  IF recent_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.submission_attempts(kind, fingerprint_hash)
  VALUES (p_kind, p_fingerprint_hash);

  RETURN true;
END;
$$;
