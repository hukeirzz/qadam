-- Запусти в Supabase Dashboard → SQL Editor
-- Исправляет auto-создание профиля при регистрации

-- Убедись что таблица user_profiles существует с нужными колонками
alter table user_profiles
  add column if not exists name text default 'Игрок',
  add column if not exists streak int default 0,
  add column if not exists gems int default 0,
  add column if not exists xp int default 0,
  add column if not exists premium_unlocked boolean default false,
  add column if not exists last_activity date;

-- Обновлённый триггер — берёт имя из метаданных при регистрации
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id, name, streak, gems, xp, premium_unlocked)
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

-- Включить realtime для user_profiles (чтобы premium_unlocked обновлялся мгновенно)
alter publication supabase_realtime add table user_profiles;
