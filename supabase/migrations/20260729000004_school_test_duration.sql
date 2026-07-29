-- Время прохождения теста — считается в приложении молча (таймер нигде не
-- показывается), нужно только координатору в результатах.
alter table school_test_results
  add column if not exists duration_seconds int;

create or replace function school_test_result_normalize()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select count(*) into new.total from school_test_questions q where q.test_id = new.test_id;
  new.score := greatest(0, least(coalesce(new.score, 0), new.total));
  if new.duration_seconds is not null then
    new.duration_seconds := greatest(0, new.duration_seconds);
  end if;
  return new;
end; $$;
