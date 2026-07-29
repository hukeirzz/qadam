-- pet_name/pet_type были добавлены к старой user_profiles (см.
-- 20260722000001, 20260724000002), но та таблица давно переименована в
-- students (20260725000001) и на новом проекте эти миграции так и не
-- применили — экран выбора питомца молча не сохранялся на сервер.

alter table students
  add column if not exists pet_name text,
  add column if not exists pet_type text
    check (pet_type in ('bars', 'cat', 'dog', 'eagle', 'penguin'));
