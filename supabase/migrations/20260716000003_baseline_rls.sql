-- Baseline RLS, reconciled from supabase_schema.sql / supabase_full_setup.sql
-- (public content tables + own-row user_profiles access), supabase_update_v2.sql
-- (adds the insert policy the signup trigger needs), and supabase_theories.sql
-- (topic_theories is authenticated-only read, unlike the other public content
-- tables — kept as-is, flagged as a minor existing inconsistency, not "fixed").
--
-- The realtime-publication block is the idempotent version from
-- supabase_full_setup.sql; supabase_fix_profiles.sql's unconditional
-- duplicate of the same statement is dropped (it would error on a project
-- where the guarded version already ran).
--
-- NOT YET VERIFIED against the live project — see 20260716000001 header.

alter table user_profiles   enable row level security;
alter table topics          enable row level security;
alter table questions       enable row level security;
alter table options         enable row level security;
alter table topic_theories  enable row level security;

drop policy if exists "Users can read own profile" on user_profiles;
drop policy if exists "Users can update own profile" on user_profiles;
drop policy if exists "Service can insert profiles" on user_profiles;
drop policy if exists "Public read topics" on topics;
drop policy if exists "Public read questions" on questions;
drop policy if exists "Public read options" on options;
drop policy if exists "Authenticated users can read theories" on topic_theories;

create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = id);

create policy "Service can insert profiles"
  on user_profiles for insert with check (true);

create policy "Public read topics"    on topics    for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public read options"   on options   for select using (true);

create policy "Authenticated users can read theories"
  on topic_theories for select
  to authenticated
  using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'user_profiles'
  ) then
    alter publication supabase_realtime add table user_profiles;
  end if;
end $$;
