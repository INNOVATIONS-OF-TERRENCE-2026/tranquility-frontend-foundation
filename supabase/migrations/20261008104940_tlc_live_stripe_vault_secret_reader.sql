-- The webhook signing secret is encrypted in Supabase Vault, never committed here.
-- Configure the live Stripe secret under vault.secrets.name='tlc_stripe_webhook_live'.
-- In production, an Edge environment variable STRIPE_WEBHOOK_SECRET overrides this fallback.
CREATE OR REPLACE FUNCTION public.read_tlc_stripe_webhook_secret()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT v.decrypted_secret
  FROM vault.decrypted_secrets AS v
  WHERE v.name = 'tlc_stripe_webhook_live'
  ORDER BY v.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.read_tlc_stripe_webhook_secret() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_tlc_stripe_webhook_secret() TO service_role;

COMMENT ON FUNCTION public.read_tlc_stripe_webhook_secret
IS 'Encrypted Vault Stripe webhook signing secret; callable by service_role only.';
