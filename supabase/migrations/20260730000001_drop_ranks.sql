-- Ранги удалены из продукта: убираем расчёт рангов, колонки rank/target_rank
-- и всё, что от них зависит. Необратимо: значения рангов пропадут.
-- Контент, который 20260729000008 засеял по рангам (темы/вопросы 'D'..'S'),
-- остаётся как есть, но теперь различается только по id — при необходимости
-- его чистят отдельно.

-- Триггеры и функции расчёта.
-- `drop trigger ... on <table>` падает, если таблицы нет, поэтому через if to_regclass.
do $$ begin
  if to_regclass('public.students') is not null then
    drop trigger if exists students_rank_upd on students;
  end if;
  if to_regclass('public.mock_results') is not null then
    drop trigger if exists mock_results_rank on mock_results;
  end if;
end $$;
drop function if exists trg_students_rank();
drop function if exists trg_mock_rank();
drop function if exists recompute_student_rank(uuid);
drop function if exists compute_rank(int, numeric, bool);

-- Вьюха рейтинга зависит от students.rank — пересоздаём без него.
drop view if exists public_rating;
do $$ begin
  if to_regclass('public.students') is not null then
    create view public_rating as
      select id, coalesce(nickname, name) as display_name, xp, streak, max_streak, school_id, class_id
      from students
      where show_in_school_rating = true;
    grant select on public_rating to authenticated;
  end if;
end $$;

-- Колонки.
drop index if exists idx_topics_subject_rank;
alter table if exists students     drop column if exists rank;
alter table if exists topics       drop column if exists rank;
alter table if exists questions    drop column if exists rank;
alter table if exists school_tests drop column if exists target_rank;
