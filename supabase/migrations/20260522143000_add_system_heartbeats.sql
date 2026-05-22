create table if not exists public.system_heartbeats (
  job_name text primary key,
  last_succeeded_at timestamptz,
  last_status text not null check (last_status in ('success', 'error')),
  last_error text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.system_heartbeats enable row level security;

drop policy if exists "admins can read system heartbeats" on public.system_heartbeats;

create policy "admins can read system heartbeats"
on public.system_heartbeats
for select
to authenticated
using (public.is_admin());
