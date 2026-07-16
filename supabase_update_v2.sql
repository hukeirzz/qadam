-- ══════════════════════════════════════════════════════════════
-- Запусти в Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Добавляем completed_topics и weekly_steps в user_profiles
alter table user_profiles
  add column if not exists completed_topics text[]  default '{}',
  add column if not exists weekly_steps     int[]   default '{0,0,0,0,0,0,0}',
  add column if not exists week_start       date;

-- 2. Убираем подтверждение email → сделай это вручную:
--    Supabase Dashboard → Authentication → Providers → Email
--    → выключи "Confirm email"

-- 3. Удаляем таблицу user_topic_progress (шаги теперь в user_profiles.completed_topics)
drop table if exists user_topic_progress cascade;

-- 4. Политика INSERT для user_profiles (нужна для триггера)
drop policy if exists "Service can insert profiles" on user_profiles;
create policy "Service can insert profiles"
  on user_profiles for insert with check (true);
