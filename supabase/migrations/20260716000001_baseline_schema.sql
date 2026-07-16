-- Baseline schema, reconstructed from the 14 supabase_*.sql files that used
-- to live at the repo root (now in supabase/_archive/) and were applied by
-- hand via the Supabase SQL Editor over time.
--
-- NOT YET VERIFIED against the live project — run `supabase db diff` before
-- treating this as authoritative, then `supabase migration repair --status
-- applied <version>` so `supabase db push` doesn't try to re-run it.
--
-- user_topic_progress intentionally omitted: it was created by the original
-- supabase_schema.sql/supabase_full_setup.sql but dropped by
-- supabase_update_v2.sql once progress moved to user_profiles.completed_topics.

create table if not exists user_profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text not null default 'Игрок',
  streak            int not null default 0,
  gems              int not null default 0,
  xp                int not null default 0,
  premium_unlocked  boolean not null default false,
  last_activity     date,
  created_at        timestamptz not null default now(),
  completed_topics  text[] default '{}',
  weekly_steps      int[] default '{0,0,0,0,0,0,0}',
  week_start        date,
  daily_steps       jsonb default '{}',
  topic_hearts      jsonb default '{}'
);

create table if not exists topics (
  id          text primary key,
  subject_id  text not null,
  title       text not null,
  order_num   int not null default 0,
  xp_reward   int not null default 10,
  created_at  timestamptz not null default now()
);

create table if not exists questions (
  id           text primary key,
  topic_id     text not null,
  subject_id   text not null,
  text         text not null,
  explanation  text,
  xp_reward    int not null default 10,
  created_at   timestamptz not null default now()
);

create table if not exists options (
  id           text primary key,
  question_id  text not null references questions(id) on delete cascade,
  text         text not null,
  is_correct   boolean not null default false
);

create table if not exists topic_theories (
  id          uuid primary key default gen_random_uuid(),
  topic_id    text not null unique,
  subject_id  text not null,
  title       text not null,
  content     text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
