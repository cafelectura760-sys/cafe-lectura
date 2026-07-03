do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'media_assets'
      and column_name = 'public_url'
  ) then
    alter table public.media_assets
      rename column public_url to asset_path;
  end if;
end
$$;

alter table public.media_assets
  alter column provider drop default;

alter table public.media_assets
  alter column provider set default 'supabase-storage';

alter table public.media_assets
  drop constraint if exists media_assets_provider_check;

alter table public.media_assets
  add constraint media_assets_provider_check
  check (provider = 'supabase-storage');

update public.media_assets
set
  provider = 'supabase-storage',
  asset_path = storage_key
where provider <> 'supabase-storage'
   or asset_path is distinct from storage_key;
