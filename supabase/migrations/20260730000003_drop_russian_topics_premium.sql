-- Доудаляем языковые темы из «премиум»-разделов (grammar_premium,
-- analogies_premium, reading_premium): 20260730000002 трогал только базовые
-- id. Условие по префиксу, чтобы поймать и любые другие варианты суффикса.
-- Сами разделы в subjects остаются. Необратимо.
do $$
declare
  t text;
begin
  foreach t in array array['student_topic_stats', 'questions', 'topic_theories', 'topics'] loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'delete from %I where subject_id ~ ''^(grammar|analogies|reading)(_|$)''', t
      );
    end if;
  end loop;
end $$;
