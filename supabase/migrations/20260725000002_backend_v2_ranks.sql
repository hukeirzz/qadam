-- Backend v2 — часть 2: расчёт ранга. XP-пороги; ранг S дополнительно требует
-- средний балл пробных > 200; ранги выше D доступны только при премиуме.
-- Применено к живому проекту через MCP 2026-07-25.

create or replace function compute_rank(p_xp int, p_avg_mock numeric, p_premium bool)
returns text language sql immutable as $$
  select case
    when not coalesce(p_premium, false) then 'D'
    when p_xp >= 8000 and coalesce(p_avg_mock, 0) > 200 then 'S'
    when p_xp >= 5000 then 'A'
    when p_xp >= 2500 then 'B'
    when p_xp >= 1000 then 'C'
    else 'D'
  end;
$$;

create or replace function recompute_student_rank(p_student uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_xp int; v_prem bool; v_avg numeric;
begin
  select xp, premium_unlocked into v_xp, v_prem from students where id = p_student;
  if not found then return; end if;
  select avg(total) into v_avg from mock_results where student_id = p_student;
  update students set rank = compute_rank(v_xp, v_avg, v_prem) where id = p_student;
end; $$;

create or replace function trg_students_rank() returns trigger language plpgsql
set search_path = public as $$
begin
  new.rank := compute_rank(
    new.xp,
    (select avg(total) from mock_results where student_id = new.id),
    new.premium_unlocked
  );
  return new;
end; $$;
drop trigger if exists students_rank_upd on students;
create trigger students_rank_upd
  before insert or update of xp, premium_unlocked on students
  for each row execute function trg_students_rank();

create or replace function trg_mock_rank() returns trigger language plpgsql
security definer set search_path = public as $$
begin
  perform recompute_student_rank(coalesce(new.student_id, old.student_id));
  return coalesce(new, old);
end; $$;
drop trigger if exists mock_results_rank on mock_results;
create trigger mock_results_rank
  after insert or update or delete on mock_results
  for each row execute function trg_mock_rank();
