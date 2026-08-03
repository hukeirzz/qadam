-- Per-rank content on the backend: topics carry a rank, and every
-- (subject × rank) cell is seeded with template topics / theory / questions so
-- no rank is empty. Existing topics keep the default rank 'D'. Idempotent and
-- self-sufficient (guards the rank/kind columns in case the migrations that
-- introduced them elsewhere haven't been applied on this project yet).

alter table topics
  add column if not exists rank text not null default 'D'
    check (rank in ('D', 'C', 'B', 'A', 'S'));
create index if not exists idx_topics_subject_rank on topics(subject_id, rank);

alter table questions
  add column if not exists rank text check (rank in ('D', 'C', 'B', 'A', 'S'));
alter table questions
  add column if not exists kind text not null default 'practice'
    check (kind in ('practice', 'theory'));

do $$
declare
  subj record;
  ranks text[] := array['D', 'C', 'B', 'A', 'S'];
  rk text;
  t int; q int; o int;
  v_topic_id text; v_question_id text;
begin
  for subj in select id from subjects order by order_num loop
    foreach rk in array ranks loop
      for t in 1..5 loop
        v_topic_id := format('%s-%s-t%s', subj.id, rk, t);

        insert into topics (id, subject_id, title, order_num, rank)
        values (v_topic_id, subj.id, format('Тема %s · ранг %s', t, rk), t, rk)
        on conflict (id) do nothing;

        insert into topic_theories (topic_id, subject_id, title, content)
        values (
          v_topic_id, subj.id,
          format('Теория — тема %s (ранг %s)', t, rk),
          format('Шаблонная теория для темы %s раздела «%s», ранг %s. Замените этот текст реальным материалом.', t, subj.id, rk)
        )
        on conflict (topic_id) do nothing;

        for q in 1..10 loop
          v_question_id := format('%s-q%s', v_topic_id, q);

          insert into questions (id, topic_id, subject_id, text, explanation, rank, kind)
          values (
            v_question_id, v_topic_id, subj.id,
            format('Шаблонный вопрос %s — тема %s, раздел «%s», ранг %s', q, t, subj.id, rk),
            'Шаблонное пояснение к правильному ответу.',
            rk, 'practice'
          )
          on conflict (id) do nothing;

          for o in 1..4 loop
            insert into options (id, question_id, text, is_correct)
            values (
              format('%s-o%s', v_question_id, o), v_question_id,
              format('Вариант %s', o),
              o = 1 + (q % 4)
            )
            on conflict (id) do nothing;
          end loop;
        end loop;
      end loop;
    end loop;
  end loop;
end $$;
