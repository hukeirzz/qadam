-- Два типа заданий ОРТ по математике:
--   choice  — вопрос и 4–5 вариантов ответа (часть II);
--   compare — «сравнение величин»: колонки А и Б, ответы всегда одни и те же (часть I).
-- Ответы на сравнение хранятся как обычные 4 строки school_test_options, поэтому результаты,
-- аналитика и раннер учеников работают без изменений. Идемпотентно.
alter table school_tests
  add column if not exists kind text not null default 'choice';
alter table school_tests drop constraint if exists school_tests_kind_check;
alter table school_tests add constraint school_tests_kind_check check (kind in ('choice', 'compare'));

-- Для сравнения: text = «дано» (может быть пустым), col_a/col_b — величины (текст с формулами $…$).
alter table school_test_questions
  add column if not exists col_a text,
  add column if not exists col_b text;
