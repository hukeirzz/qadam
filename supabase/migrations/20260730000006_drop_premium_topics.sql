-- Премиум-тем больше нет: удаляем все темы разделов с суффиксом _premium
-- (math_premium, geometry_premium, ...) вместе со статистикой, вопросами и
-- теорией. topic_levels чистится каскадом от topics. Сами разделы в subjects
-- остаются. Необратимо. Таблицы, которых нет в базе, пропускаются.
do $$
declare
  t text;
begin
  foreach t in array array['student_topic_stats', 'questions', 'topic_theories', 'topics'] loop
    if to_regclass('public.' || t) is not null then
      execute format('delete from %I where subject_id like ''%%\_premium''', t);
    end if;
  end loop;
end $$;
