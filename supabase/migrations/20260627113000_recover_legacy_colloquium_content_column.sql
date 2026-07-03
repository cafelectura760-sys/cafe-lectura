create or replace function public.plain_text_from_legacy_colloquium_content(value text)
returns text
language sql
immutable
as $$
  select trim(
    both E'\n'
    from regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(coalesce(value, ''), E'\\r\\n?', E'\n', 'g'),
                E'\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
                E'\\1',
                'g'
              ),
              E'(^|\\n)\\s{0,3}#{1,6}\\s*',
              E'\\1',
              'g'
            ),
            E'(^|\\n)\\s*[-*+]\\s+',
            E'\\1',
            'g'
          ),
          E'(^|\\n)\\s*\\d+\\.\\s+',
          E'\\1',
          'g'
        ),
        E'[`*_>#]+',
        '',
        'g'
      ),
      E'\\n{3,}',
      E'\n\n',
      'g'
    )
  );
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'colloquiums'
      and column_name = 'content'
  ) then
    insert into public.colloquium_sections (
      colloquium_id,
      type,
      title,
      content,
      display_order
    )
    select
      colloquiums.id,
      'text',
      'Contenido migrado',
      public.plain_text_from_legacy_colloquium_content(colloquiums.content),
      0
    from public.colloquiums
    where colloquiums.content is not null
      and btrim(colloquiums.content) <> ''
      and not exists (
        select 1
        from public.colloquium_sections
        where colloquium_sections.colloquium_id = colloquiums.id
      );

    alter table public.colloquiums
      drop column if exists content;
  end if;
end
$$;

drop function if exists public.plain_text_from_legacy_colloquium_content(text);
