CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'email',
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  recipient TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  CONSTRAINT notification_deliveries_channel_check CHECK (channel IN ('email')),
  CONSTRAINT notification_deliveries_status_check CHECK (status IN ('pending','sent','failed','skipped'))
);

CREATE INDEX IF NOT EXISTS notification_deliveries_status_idx
  ON public.notification_deliveries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS notification_deliveries_entity_idx
  ON public.notification_deliveries (entity_type, entity_id, created_at DESC);

GRANT SELECT ON public.notification_deliveries TO authenticated;
GRANT ALL ON public.notification_deliveries TO service_role;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verified owner reads notification deliveries" ON public.notification_deliveries;
CREATE POLICY "Verified owner reads notification deliveries"
ON public.notification_deliveries FOR SELECT TO authenticated
USING ((select private.is_owner()));
