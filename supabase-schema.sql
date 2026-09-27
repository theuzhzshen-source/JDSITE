-- JANITOR DAYS / SUPABASE
create extension if not exists pgcrypto;
create table if not exists public.suggestions (
 id uuid primary key default gen_random_uuid(),
 shift text not null check (shift in ('MORNING','AFTERNOON')),
 song text not null,
 artist text not null,
 observation text,
 status text not null default 'PENDING' check (status in ('PENDING','REVIEWED','ACCEPTED','REJECTED')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.suggestions enable row level security;
drop policy if exists "public can insert suggestions" on public.suggestions;
create policy "public can insert suggestions" on public.suggestions for insert to anon,authenticated with check (true);
drop policy if exists "admins can read suggestions" on public.suggestions;
create policy "admins can read suggestions" on public.suggestions for select to authenticated using (auth.jwt()->>'email' = 'jadaybanda@gmail.com');
drop policy if exists "admins can update suggestions" on public.suggestions;
create policy "admins can update suggestions" on public.suggestions for update to authenticated using (auth.jwt()->>'email' = 'jadaybanda@gmail.com') with check (auth.jwt()->>'email' = 'jadaybanda@gmail.com');
drop policy if exists "admins can delete suggestions" on public.suggestions;
create policy "admins can delete suggestions" on public.suggestions for delete to authenticated using (auth.jwt()->>'email' = 'jadaybanda@gmail.com');
create index if not exists suggestions_song_artist_idx on public.suggestions (lower(song),lower(artist));
create index if not exists suggestions_created_idx on public.suggestions (created_at desc);
-- ============================================
-- PRÓXIMOS SHOWS
-- ============================================

create table if not exists public.upcoming_shows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  show_date date not null,
  created_at timestamptz not null default now()
);

alter table public.upcoming_shows enable row level security;

-- Qualquer visitante pode visualizar os próximos shows
drop policy if exists "public can read upcoming shows" on public.upcoming_shows;

create policy "public can read upcoming shows"
on public.upcoming_shows
for select
to anon, authenticated
using (true);

-- Apenas o administrador pode criar
drop policy if exists "admins can insert upcoming shows" on public.upcoming_shows;

create policy "admins can insert upcoming shows"
on public.upcoming_shows
for insert
to authenticated
with check (
  auth.jwt()->>'email' = 'jadaybanda@gmail.com'
);

-- Apenas o administrador pode editar
drop policy if exists "admins can update upcoming shows" on public.upcoming_shows;

create policy "admins can update upcoming shows"
on public.upcoming_shows
for update
to authenticated
using (
  auth.jwt()->>'email' = 'jadaybanda@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'jadaybanda@gmail.com'
);

-- Apenas o administrador pode excluir
drop policy if exists "admins can delete upcoming shows" on public.upcoming_shows;

create policy "admins can delete upcoming shows"
on public.upcoming_shows
for delete
to authenticated
using (
  auth.jwt()->>'email' = 'jadaybanda@gmail.com'
);

create index if not exists upcoming_shows_date_idx
on public.upcoming_shows (show_date);