-- public_rating не отдавала streak/max_streak, хотя они есть в students
-- (бывшая user_profiles, переименована в 20260725000001) — экран Рейтинга
-- не может сортировать «по серии дней» без этих колонок.
create or replace view public_rating as
  select id, coalesce(nickname, name) as display_name, xp, rank, streak, max_streak, school_id, class_id
  from students
  where show_in_school_rating = true;
