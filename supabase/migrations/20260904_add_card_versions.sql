-- Allow multiple approved and pending versions for one stable card ID.
-- The existing `id` column remains the stable card ID used by the client.
alter table public.cards
  add column if not exists record_id uuid default gen_random_uuid();

update public.cards
set record_id = gen_random_uuid()
where record_id is null;

alter table public.cards
  alter column record_id set not null;

alter table public.cards
  drop constraint if exists cards_pkey;

alter table public.cards
  add constraint cards_pkey primary key (record_id);

create unique index if not exists cards_id_version_key
  on public.cards (id, version);

create index if not exists cards_approved_id_created_at_idx
  on public.cards (id, status, created_at desc);
