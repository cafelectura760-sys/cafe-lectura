create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

alter table public.colloquiums
  add column if not exists slug text,
  add column if not exists status text not null default 'published' check (status in ('draft', 'published')),
  add column if not exists excerpt text,
  add column if not exists hero_image_asset_id uuid,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.colloquiums
set slug = concat(
  public.slugify(title),
  '-',
  left(id::text, 8)
)
where slug is null or btrim(slug) = '';

alter table public.colloquiums
  alter column slug set not null;

create unique index if not exists colloquiums_slug_key on public.colloquiums (slug);
create index if not exists colloquiums_status_idx on public.colloquiums (status);

create table if not exists public.colloquium_sections (
  id uuid primary key default gen_random_uuid(),
  colloquium_id uuid not null references public.colloquiums (id) on delete cascade,
  type text not null check (
    type in (
      'intro_text',
      'host_words',
      'presentation',
      'audio_sequence',
      'image',
      'qa',
      'closing',
      'other_comments',
      'custom'
    )
  ),
  title text,
  content text,
  display_order integer not null check (display_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.colloquium_entries (
  id uuid primary key default gen_random_uuid(),
  colloquium_id uuid not null references public.colloquiums (id) on delete cascade,
  section_id uuid not null references public.colloquium_sections (id) on delete cascade,
  type text not null check (
    type in (
      'question',
      'answer',
      'contribution',
      'comment',
      'central_idea',
      'closing',
      'other'
    )
  ),
  role text not null default 'other' check (
    role in ('reader', 'host', 'presenter', 'anonymous', 'other')
  ),
  label text,
  participant_name text,
  participant_location text,
  central_idea text,
  content text,
  related_to_entry_id uuid references public.colloquium_entries (id) on delete set null,
  display_order integer not null check (display_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  colloquium_id uuid not null references public.colloquiums (id) on delete cascade,
  section_id uuid references public.colloquium_sections (id) on delete cascade,
  entry_id uuid references public.colloquium_entries (id) on delete cascade,
  type text not null check (type in ('image', 'audio')),
  provider text not null default 'cloudflare-r2' check (provider = 'cloudflare-r2'),
  bucket text not null,
  storage_key text not null,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds >= 0),
  title text,
  caption text,
  alt_text text,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists media_assets_storage_key_key on public.media_assets (storage_key);
create index if not exists colloquium_sections_colloquium_id_idx on public.colloquium_sections (colloquium_id, display_order);
create index if not exists colloquium_entries_section_id_idx on public.colloquium_entries (section_id, display_order);
create index if not exists colloquium_entries_colloquium_id_idx on public.colloquium_entries (colloquium_id, display_order);
create index if not exists media_assets_colloquium_id_idx on public.media_assets (colloquium_id, display_order);
create index if not exists media_assets_section_id_idx on public.media_assets (section_id, display_order);
create index if not exists media_assets_entry_id_idx on public.media_assets (entry_id, display_order);

alter table public.colloquiums
  add constraint colloquiums_hero_image_asset_id_fkey
  foreign key (hero_image_asset_id)
  references public.media_assets (id)
  on delete set null;

drop trigger if exists set_colloquiums_updated_at on public.colloquiums;
create trigger set_colloquiums_updated_at
before update on public.colloquiums
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_colloquium_sections_updated_at on public.colloquium_sections;
create trigger set_colloquium_sections_updated_at
before update on public.colloquium_sections
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_colloquium_entries_updated_at on public.colloquium_entries;
create trigger set_colloquium_entries_updated_at
before update on public.colloquium_entries
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_media_assets_updated_at on public.media_assets;
create trigger set_media_assets_updated_at
before update on public.media_assets
for each row
execute function public.set_row_updated_at();

alter table public.colloquium_sections enable row level security;
alter table public.colloquium_entries enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "members can read published colloquiums and admins can read all" on public.colloquiums;
drop policy if exists "admins can read all colloquiums" on public.colloquiums;
drop policy if exists "members with active membership can read colloquiums" on public.colloquiums;
drop policy if exists "admins can insert colloquiums" on public.colloquiums;
drop policy if exists "admins can update colloquiums" on public.colloquiums;
drop policy if exists "admins can delete colloquiums" on public.colloquiums;

create policy "members can read published colloquiums and admins can read all"
on public.colloquiums
for select
to authenticated
using (
  public.is_admin()
  or (
    status = 'published'
    and public.has_active_membership()
  )
);

create policy "admins can insert colloquiums"
on public.colloquiums
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update colloquiums"
on public.colloquiums
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete colloquiums"
on public.colloquiums
for delete
to authenticated
using (public.is_admin());

drop policy if exists "members can read published colloquium sections and admins can read all" on public.colloquium_sections;
drop policy if exists "admins can insert colloquium sections" on public.colloquium_sections;
drop policy if exists "admins can update colloquium sections" on public.colloquium_sections;
drop policy if exists "admins can delete colloquium sections" on public.colloquium_sections;

create policy "members can read published colloquium sections and admins can read all"
on public.colloquium_sections
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.colloquiums
    where id = colloquium_id
      and status = 'published'
      and public.has_active_membership()
  )
);

create policy "admins can insert colloquium sections"
on public.colloquium_sections
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update colloquium sections"
on public.colloquium_sections
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete colloquium sections"
on public.colloquium_sections
for delete
to authenticated
using (public.is_admin());

drop policy if exists "members can read published colloquium entries and admins can read all" on public.colloquium_entries;
drop policy if exists "admins can insert colloquium entries" on public.colloquium_entries;
drop policy if exists "admins can update colloquium entries" on public.colloquium_entries;
drop policy if exists "admins can delete colloquium entries" on public.colloquium_entries;

create policy "members can read published colloquium entries and admins can read all"
on public.colloquium_entries
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.colloquiums
    where id = colloquium_id
      and status = 'published'
      and public.has_active_membership()
  )
);

create policy "admins can insert colloquium entries"
on public.colloquium_entries
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update colloquium entries"
on public.colloquium_entries
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete colloquium entries"
on public.colloquium_entries
for delete
to authenticated
using (public.is_admin());

drop policy if exists "members can read published media assets and admins can read all" on public.media_assets;
drop policy if exists "admins can insert media assets" on public.media_assets;
drop policy if exists "admins can update media assets" on public.media_assets;
drop policy if exists "admins can delete media assets" on public.media_assets;

create policy "members can read published media assets and admins can read all"
on public.media_assets
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.colloquiums
    where id = colloquium_id
      and status = 'published'
      and public.has_active_membership()
  )
);

create policy "admins can insert media assets"
on public.media_assets
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update media assets"
on public.media_assets
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete media assets"
on public.media_assets
for delete
to authenticated
using (public.is_admin());
