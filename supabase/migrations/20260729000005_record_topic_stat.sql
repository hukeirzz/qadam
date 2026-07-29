-- Мобильное приложение никогда не писало в student_topic_stats — RLS и
-- таблица (backend_v2_tables/backend_v2_rls) готовы принимать данные с
-- момента их создания, но ни один экран не вызывал ни insert, ни update:
-- координатор/директор в school-web видел «Пока нет данных по практике»
-- даже у активно занимающихся учеников. Это RPC, который вызывается при
-- завершении темы (CorrectAnswerScreen → completeQuiz).
--
-- SECURITY DEFINER не для обхода RLS (sts_student_all и так разрешает
-- ученику писать свою строку), а чтобы атомарно прибавить correct_first/
-- answered к уже накопленным значениям одним запросом вместо read-then-
-- write с гонкой на клиенте.
create or replace function record_topic_stat(p_topic_id text, p_subject_id text, p_correct int, p_answered int)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into student_topic_stats (student_id, topic_id, subject_id, correct_first, answered, updated_at)
  values (auth.uid(), p_topic_id, p_subject_id, greatest(0, p_correct), greatest(0, p_answered), now())
  on conflict (student_id, topic_id) do update
    set correct_first = student_topic_stats.correct_first + greatest(0, p_correct),
        answered = student_topic_stats.answered + greatest(0, p_answered),
        subject_id = excluded.subject_id,
        updated_at = now();
end; $$;

grant execute on function record_topic_stat(text, text, int, int) to authenticated;
