revoke all privileges on table
  public.profiles,
  public.books,
  public.colloquiums,
  public.colloquium_sections,
  public.colloquium_entries,
  public.colloquium_participants,
  public.media_assets,
  public.system_heartbeats
from public, anon, authenticated;

grant select on table public.books to anon;

grant select, insert, update, delete on table
  public.profiles,
  public.books,
  public.colloquiums,
  public.colloquium_sections,
  public.colloquium_entries,
  public.colloquium_participants,
  public.media_assets
to authenticated;

grant select on table public.system_heartbeats to authenticated;

grant all privileges on table
  public.profiles,
  public.books,
  public.colloquiums,
  public.colloquium_sections,
  public.colloquium_entries,
  public.colloquium_participants,
  public.media_assets,
  public.system_heartbeats
to service_role;
