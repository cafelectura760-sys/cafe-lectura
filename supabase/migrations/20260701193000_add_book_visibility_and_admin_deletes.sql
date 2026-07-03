alter table public.books
  add column if not exists status text not null default 'published'
  check (status in ('published', 'hidden'));

create index if not exists books_status_idx on public.books (status);

drop policy if exists "public can read books" on public.books;

create policy "public can read books"
on public.books
for select
to anon, authenticated
using (status = 'published' or public.is_admin());
