create policy "Deny public access to availability blocks"
on public.availability_blocks
for all
to anon, authenticated
using (false)
with check (false);