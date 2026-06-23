create or replace function public.plain_text_from_markdown(value text)
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

insert into public.colloquium_sections (
  colloquium_id,
  type,
  title,
  content,
  display_order
)
select
  colloquiums.id,
  'content',
  'Contenido migrado',
  public.plain_text_from_markdown(colloquiums.content),
  0
from public.colloquiums
where colloquiums.content is not null
  and btrim(colloquiums.content) <> ''
  and not exists (
    select 1
    from public.colloquium_sections
    where colloquium_sections.colloquium_id = colloquiums.id
  );

update public.colloquium_sections
set type = case type
  when 'intro_text' then 'intro'
  when 'host_words' then 'intro'
  when 'presentation' then 'content'
  when 'audio_sequence' then 'audio'
  when 'image' then 'image'
  when 'qa' then 'qa'
  when 'closing' then 'closing'
  when 'other_comments' then 'content'
  when 'custom' then 'content'
  else type
end;

alter table public.colloquium_sections
  drop constraint if exists colloquium_sections_type_check;

alter table public.colloquium_sections
  add constraint colloquium_sections_type_check
  check (type in ('intro', 'content', 'qa', 'audio', 'image', 'closing'));

alter table public.colloquiums
  drop column if exists content;

drop function if exists public.plain_text_from_markdown(text);
