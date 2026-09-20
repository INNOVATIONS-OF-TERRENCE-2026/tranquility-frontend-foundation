create table public.quote_media (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  object_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

grant all on public.quote_media to service_role;

alter table public.quote_media enable row level security;

create policy "Deny public access to quote media"
on public.quote_media
for all
to anon, authenticated
using (false)
with check (false);

create index quote_media_quote_idx on public.quote_media (quote_request_id, created_at);

create policy "Admins can read quote media files"
on storage.objects
for select
to authenticated
using (bucket_id = 'quote-media' and private.has_role(auth.uid(), 'admin'));