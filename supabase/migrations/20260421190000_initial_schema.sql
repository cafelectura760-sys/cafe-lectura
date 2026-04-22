create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  membership_expires_at timestamptz not null default (timezone('utc', now()) + interval '1 year'),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  synopsis text not null,
  cover_image_url text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.colloquiums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  book_id uuid not null references public.books (id) on delete restrict,
  published_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_membership_expires_at_idx on public.profiles (membership_expires_at);
create index if not exists books_created_at_idx on public.books (created_at desc);
create index if not exists colloquiums_book_id_idx on public.colloquiums (book_id);
create index if not exists colloquiums_published_at_idx on public.colloquiums (published_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.has_active_membership()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (
        role = 'admin'
        or membership_expires_at > timezone('utc', now())
      )
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.has_active_membership() from public;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.has_active_membership() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.colloquiums enable row level security;

drop policy if exists "admins can read all profiles" on public.profiles;
drop policy if exists "users can read their own profile" on public.profiles;
drop policy if exists "admins can insert profiles" on public.profiles;
drop policy if exists "admins can update profiles" on public.profiles;
drop policy if exists "admins can delete profiles" on public.profiles;
drop policy if exists "public can read books" on public.books;
drop policy if exists "admins can insert books" on public.books;
drop policy if exists "admins can update books" on public.books;
drop policy if exists "admins can delete books" on public.books;
drop policy if exists "members with active membership can read colloquiums" on public.colloquiums;
drop policy if exists "admins can insert colloquiums" on public.colloquiums;
drop policy if exists "admins can update colloquiums" on public.colloquiums;
drop policy if exists "admins can delete colloquiums" on public.colloquiums;

create policy "admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

create policy "users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "admins can insert profiles"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update profiles"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete profiles"
on public.profiles
for delete
to authenticated
using (public.is_admin());

create policy "public can read books"
on public.books
for select
to anon, authenticated
using (true);

create policy "admins can insert books"
on public.books
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update books"
on public.books
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete books"
on public.books
for delete
to authenticated
using (public.is_admin());

create policy "members with active membership can read colloquiums"
on public.colloquiums
for select
to authenticated
using (public.has_active_membership());

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
