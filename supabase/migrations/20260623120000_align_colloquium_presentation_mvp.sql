create table if not exists public.colloquium_participants (
  id uuid primary key default gen_random_uuid(),
  colloquium_id uuid not null references public.colloquiums (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  role text not null check (role in ('host', 'presenter', 'guest', 'other')),
  display_order integer not null check (display_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.colloquium_sections
  add column if not exists participant_id uuid,
  add column if not exists speaker_role text,
  add column if not exists speaker_name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'colloquium_sections_participant_id_fkey'
  ) then
    alter table public.colloquium_sections
      add constraint colloquium_sections_participant_id_fkey
      foreign key (participant_id)
      references public.colloquium_participants (id)
      on delete set null;
  end if;
end
$$;

alter table public.colloquium_sections
  drop constraint if exists colloquium_sections_speaker_role_check;

alter table public.colloquium_sections
  add constraint colloquium_sections_speaker_role_check
  check (
    speaker_role is null
    or speaker_role in ('host', 'presenter', 'guest', 'other')
  );

update public.colloquium_sections
set type = case
  when type in ('audio', 'audio_sequence') then 'audio'
  when type = 'qa' then 'qa'
  when type = 'image' then 'image'
  else 'text'
end;

alter table public.colloquium_sections
  drop constraint if exists colloquium_sections_type_check;

alter table public.colloquium_sections
  add constraint colloquium_sections_type_check
  check (type in ('text', 'audio', 'qa', 'image'));

create index if not exists colloquium_participants_colloquium_id_idx
  on public.colloquium_participants (colloquium_id, display_order);

create index if not exists colloquium_sections_participant_id_idx
  on public.colloquium_sections (participant_id);

drop trigger if exists set_colloquium_participants_updated_at on public.colloquium_participants;

create trigger set_colloquium_participants_updated_at
before update on public.colloquium_participants
for each row
execute function public.set_row_updated_at();

alter table public.colloquium_participants enable row level security;

drop policy if exists "members can read published colloquium participants and admins can read all" on public.colloquium_participants;
drop policy if exists "admins can insert colloquium participants" on public.colloquium_participants;
drop policy if exists "admins can update colloquium participants" on public.colloquium_participants;
drop policy if exists "admins can delete colloquium participants" on public.colloquium_participants;

create policy "members can read published colloquium participants and admins can read all"
on public.colloquium_participants
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

create policy "admins can insert colloquium participants"
on public.colloquium_participants
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update colloquium participants"
on public.colloquium_participants
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete colloquium participants"
on public.colloquium_participants
for delete
to authenticated
using (public.is_admin());
