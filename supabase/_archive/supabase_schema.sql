-- Запусти этот SQL в Supabase Dashboard → SQL Editor

-- 1. Профили пользователей
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default 'Пользователь',
  streak int default 0,
  gems int default 0,
  xp int default 0,
  premium_unlocked boolean default false,
  last_activity date,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Пользователь'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Темы (добавляются через Supabase Dashboard)
create table if not exists topics (
  id text primary key,
  subject_id text not null,
  title text not null,
  order_num int not null default 0,
  xp_reward int default 10,
  created_at timestamptz default now()
);

-- 3. Вопросы
create table if not exists questions (
  id text primary key,
  topic_id text not null,
  subject_id text not null,
  text text not null,
  explanation text,
  xp_reward int default 10,
  created_at timestamptz default now()
);

-- 4. Варианты ответов
create table if not exists options (
  id text primary key,
  question_id text not null references questions(id) on delete cascade,
  text text not null,
  is_correct boolean default false
);

-- 5. Прогресс по темам
create table if not exists user_topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  completed_at timestamptz default now(),
  primary key (user_id, topic_id)
);

-- RLS (Row Level Security)
alter table user_profiles enable row level security;
alter table user_topic_progress enable row level security;

create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = id);

create policy "Users can manage own progress"
  on user_topic_progress for all using (auth.uid() = user_id);

-- Topics/Questions/Options are public (читать может любой)
alter table topics enable row level security;
alter table questions enable row level security;
alter table options enable row level security;

create policy "Public read topics" on topics for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public read options" on options for select using (true);

-- Чтобы открыть Premium пользователю, выполни в Dashboard:
-- update user_profiles set premium_unlocked = true where id = 'USER_UUID';
