-- Макс. серия дней у ученика (+ триггер: max_streak всегда >= streak).
-- Применено к живому проекту через MCP 2026-07-25.

alter table students add column if not exists max_streak int not null default 0;

create or replace function trg_max_streak() returns trigger language plpgsql
set search_path = public as $$
begin
  if new.streak > coalesce(new.max_streak, 0) then new.max_streak := new.streak; end if;
  return new;
end; $$;
drop trigger if exists students_max_streak on students;
create trigger students_max_streak
  before insert or update of streak on students
  for each row execute function trg_max_streak();
