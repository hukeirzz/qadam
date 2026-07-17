-- ══════════════════════════════════════════════════════════════
-- ПОЛНАЯ НАСТРОЙКА БД — запусти ВСЁ одним разом в SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Таблица профилей
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Игрок',
  streak int not null default 0,
  gems int not null default 0,
  xp int not null default 0,
  premium_unlocked boolean not null default false,
  last_activity date,
  created_at timestamptz not null default now()
);

-- 2. Темы
create table if not exists topics (
  id text primary key,
  subject_id text not null,
  title text not null,
  order_num int not null default 0,
  xp_reward int not null default 10,
  created_at timestamptz not null default now()
);

-- 3. Вопросы
create table if not exists questions (
  id text primary key,
  topic_id text not null,
  subject_id text not null,
  text text not null,
  explanation text,
  xp_reward int not null default 10,
  created_at timestamptz not null default now()
);

-- 4. Варианты ответов
create table if not exists options (
  id text primary key,
  question_id text not null references questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false
);

-- 5. Прогресс по темам
create table if not exists user_topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- ── Триггер: автосоздание профиля при регистрации ────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, name, streak, gems, xp, premium_unlocked)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    0, 0, 0, false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────
alter table user_profiles enable row level security;
alter table user_topic_progress enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table options enable row level security;

drop policy if exists "Users can read own profile" on user_profiles;
drop policy if exists "Users can update own profile" on user_profiles;
drop policy if exists "Users can manage own progress" on user_topic_progress;
drop policy if exists "Public read topics" on topics;
drop policy if exists "Public read questions" on questions;
drop policy if exists "Public read options" on options;

create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = id);

create policy "Users can manage own progress"
  on user_topic_progress for all using (auth.uid() = user_id);

create policy "Public read topics"    on topics    for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public read options"   on options   for select using (true);

-- Realtime — добавляем только если ещё не добавлено
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
