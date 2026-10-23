-- Run this whole file in Supabase Dashboard → SQL Editor → New query.
create extension if not exists pgcrypto;
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 3 and 180),
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.prompts enable row level security;
alter table public.messages enable row level security;
drop policy if exists "Anyone can view prompt links" on public.prompts;
create policy "Anyone can view prompt links" on public.prompts for select using (true);
drop policy if exists "Signed-in user creates own prompts" on public.prompts;
create policy "Signed-in user creates own prompts" on public.prompts for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "Owners delete own prompts" on public.prompts;
create policy "Owners delete own prompts" on public.prompts for delete to authenticated using (owner_id = auth.uid());
drop policy if exists "Anyone can send a reply to an existing prompt" on public.messages;
create policy "Anyone can send a reply to an existing prompt" on public.messages for insert to anon, authenticated with check (exists (select 1 from public.prompts p where p.id = prompt_id));
drop policy if exists "Only prompt owners can read replies" on public.messages;
create policy "Only prompt owners can read replies" on public.messages for select to authenticated using (exists (select 1 from public.prompts p where p.id = prompt_id and p.owner_id = auth.uid()));
drop policy if exists "Only prompt owners can delete replies" on public.messages;
create policy "Only prompt owners can delete replies" on public.messages for delete to authenticated using (exists (select 1 from public.prompts p where p.id = prompt_id and p.owner_id = auth.uid()));
-- Note: anonymous replies are not tied to Instagram accounts. Keep the anon key public,
-- but never publish a Supabase service_role/secret key in website files.
