-- Удаляем все темы «русского языка» — разделы grammar, analogies, reading —
-- вместе с теорией, вопросами и статистикой учеников по этим темам.
-- Сами разделы в subjects остаются. Необратимо. Таблицы, которых нет в базе,
-- пропускаются.
do $$
declare
  t text;
begin
  foreach t in array array['student_topic_stats', 'questions', 'topic_theories', 'topics'] loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'delete from %I where subject_id in (''grammar'', ''analogies'', ''reading'')', t
      );
    end if;
  end loop;
end $$;
