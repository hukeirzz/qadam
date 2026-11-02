-- Уборка после ухода от мобильного приложения: Qadam теперь только веб-платформа для учителей ОРТ.
-- Удаляем всё, что относилось к игровой механике и мобилке и больше нигде не используется:
--   * view public_rating, таблицы student_topic_stats и school_test_classes
--     (доступ к тесту решает school_test_students, а не класс);
--   * функции delete_account, public_find_school_by_code, public_find_class_by_code, trg_max_streak;
--   * игровые колонки students (xp, streak, gems, питомцы, шаги, сердца, premium…) и topics.xp_reward.
-- Идемпотентно.

-- handle_new_user больше не пишет data_consent — обновляем функцию до удаления колонки.
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_class classes%rowtype;
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1));
begin
  if coalesce(new.raw_user_meta_data->>'account_type', 'student') = 'staff' then
    insert into public.staff (id, name, role, school_id)
    values (new.id, v_name, coalesce(new.raw_user_meta_data->>'role', 'coordinator'), null)
    on conflict (id) do nothing;
  else
    select * into v_class from classes
    where upper(promo_code) = upper(trim(coalesce(new.raw_user_meta_data->>'class_code', '')))
    limit 1;

    insert into public.students (id, name, class_id, school_id, class_label)
    values (new.id, v_name, v_class.id, v_class.school_id, v_class.name)
    on conflict (id) do nothing;
  end if;
  return new;
end; $$;

drop view if exists public_rating;
drop table if exists student_topic_stats cascade;
drop table if exists school_test_classes cascade;

drop trigger if exists students_max_streak on students;
drop function if exists trg_max_streak();
drop function if exists delete_account();
drop function if exists public_find_school_by_code(text);
drop function if exists public_find_class_by_code(text);

alter table students
  drop column if exists streak,
  drop column if exists max_streak,
  drop column if exists gems,
  drop column if exists xp,
  drop column if exists premium_unlocked,
  drop column if exists premium_source,
  drop column if exists completed_topics,
  drop column if exists weekly_steps,
  drop column if exists week_start,
  drop column if exists daily_steps,
  drop column if exists topic_hearts,
  drop column if exists pet_name,
  drop column if exists pet_type,
  drop column if exists nickname,
  drop column if exists show_in_school_rating,
  drop column if exists last_activity,
  drop column if exists data_consent;

alter table topics drop column if exists xp_reward;
