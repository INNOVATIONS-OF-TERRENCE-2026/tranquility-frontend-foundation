CREATE UNIQUE INDEX IF NOT EXISTS giveaway_entries_one_winner_per_month
ON public.giveaway_entries (giveaway_month)
WHERE status IN ('selected','contacted','scheduled','completed');
