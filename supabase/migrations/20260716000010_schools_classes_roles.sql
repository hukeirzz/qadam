-- Minimal schools/classes/roles schema for the school-web Stage 1 MVP.
-- Sized deliberately small: no school_members join table yet, since
-- multi-role/multi-school users are explicitly a Stage 3 concern — this
-- extends user_profiles directly (1:1 with auth.users, matching the
-- existing pattern) with a single role/school/class per user.
--
-- NOT YET APPLIED to the live project — this is new schema, not a
-- reconciliation of existing state like 20260716000001-000009. Run via
-- `supabase db push` (or by hand in the SQL Editor) when ready.

create table if not exists schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

create table if not exists classes (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);

alter table user_profiles
  add column if not exists role       text not null default 'student'
    check (role in ('student', 'coordinator', 'admin', 'director')),
  add column if not exists school_id  uuid references schools(id),
  add column if not exists class_id   uuid references classes(id);

-- Security-definer helpers so RLS policies on user_profiles don't need a
-- self-referential subquery against the same table being policied (which
-- risks recursive policy evaluation under Postgres RLS).
create or replace function current_user_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role from user_profiles where id = auth.uid();
$$;

create or replace function current_user_school_id()
returns uuid
language sql security definer stable
set search_path = public
as $$
  select school_id from user_profiles where id = auth.uid();
$$;

alter table schools  enable row level security;
alter table classes  enable row level security;

drop policy if exists "Members can read own school" on schools;
create policy "Members can read own school"
  on schools for select using (id = current_user_school_id());

drop policy if exists "Members can read own school classes" on classes;
create policy "Members can read own school classes"
  on classes for select using (school_id = current_user_school_id());

-- Staff (coordinator/admin/director) can additionally read student
-- profiles in their own school; self-access (auth.uid() = id) is already
-- granted by the "Users can read own profile" policy from 20260716000003.
drop policy if exists "Staff can read own-school student profiles" on user_profiles;
create policy "Staff can read own-school student profiles"
  on user_profiles for select using (
    current_user_role() in ('coordinator', 'admin', 'director')
    and role = 'student'
    and school_id = current_user_school_id()
  );
