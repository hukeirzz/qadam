-- Pet, entrance-test rank (D/C/B/A/S), and competitions/rating schema.
--
-- NOT YET APPLIED to the live project — same caveat as the earlier
-- baseline migrations: run `supabase db diff` / `supabase db push`
-- yourself before treating this as authoritative.

alter table user_profiles
  add column if not exists pet_name               text,
  add column if not exists phone                   text,
  add column if not exists nickname                text,
  add column if not exists rank                    text check (rank in ('D','C','B','A','S')),
  add column if not exists entrance_test_score     int,
  add column if not exists entrance_test_total     int,
  add column if not exists show_in_school_rating   boolean not null default true,
  add column if not exists data_consent            boolean not null default false,
  add column if not exists class_label             text;

create table if not exists competitions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  prize       text,
  source      text not null check (source in ('school', 'platform')),
  school_id   uuid references schools(id) on delete cascade,
  created_by  uuid references auth.users(id) on delete set null,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  created_at  timestamptz not null default now()
);

create table if not exists competition_participants (
  competition_id uuid not null references competitions(id) on delete cascade,
  user_id        uuid not null references user_profiles(id) on delete cascade,
  xp_earned      int not null default 0,
  joined_at      timestamptz not null default now(),
  primary key (competition_id, user_id)
);

-- Safe, column-limited leaderboard/rating surface. user_profiles' RLS is
-- self-only, and columns like phone/gems/entrance_test_score shouldn't leak
-- to other users just because show_in_school_rating is true — so rating
-- reads go through a view exposing only safe columns, not a permissive
-- policy on the base table. Views run with the owner's privileges, so this
-- transparently bypasses the base table's row RLS for the querying user
-- while still hard-limiting which columns are visible.
create or replace view public_rating as
  select id, coalesce(nickname, name) as display_name, xp, rank, school_id, class_id
  from user_profiles
  where show_in_school_rating = true;

grant select on public_rating to authenticated;

alter table competitions             enable row level security;
alter table competition_participants enable row level security;

drop policy if exists "Read visible competitions" on competitions;
create policy "Read visible competitions"
  on competitions for select
  using (source = 'platform' or school_id = current_user_school_id());

drop policy if exists "Staff can create school competitions" on competitions;
create policy "Staff can create school competitions"
  on competitions for insert
  with check (
    source = 'school' and school_id = current_user_school_id()
    and current_user_role() in ('coordinator', 'admin', 'director')
    and created_by = auth.uid()
  );

drop policy if exists "Read participants of visible competitions" on competition_participants;
create policy "Read participants of visible competitions"
  on competition_participants for select
  using (exists (
    select 1 from competitions c
    where c.id = competition_participants.competition_id
      and (c.source = 'platform' or c.school_id = current_user_school_id())
  ));

drop policy if exists "Join a competition" on competition_participants;
create policy "Join a competition"
  on competition_participants for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from competitions c
      where c.id = competition_participants.competition_id
        and (c.source = 'platform' or c.school_id = current_user_school_id())
        and now() between c.start_at and c.end_at
    )
  );

drop policy if exists "Update own participation" on competition_participants;
create policy "Update own participation"
  on competition_participants for update
  using (user_id = auth.uid());

-- Note: the existing "Users can update own profile" policy on user_profiles
-- (using (auth.uid() = id), no explicit WITH CHECK) is row-level, not
-- column-level, so it already covers every new column added above with no
-- changes needed to that policy.
