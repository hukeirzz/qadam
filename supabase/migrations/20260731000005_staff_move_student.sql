-- Учитель переводит ученика своей школы в другой класс этой же школы.
-- SECURITY DEFINER: ставит флаг для триггера students_lock_class и проверяет, что и ученик,
-- и класс принадлежат школе вызывающего учителя. Идемпотентно.

create or replace function staff_move_student(p_student uuid, p_class uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_class classes%rowtype;
begin
  if not is_staff() then
    raise exception 'not_staff';
  end if;

  select * into v_class from classes where id = p_class and school_id = current_school_id();
  if not found then
    raise exception 'class_not_found';
  end if;

  if not exists (select 1 from students where id = p_student and school_id = current_school_id()) then
    raise exception 'student_not_found';
  end if;

  perform set_config('qadam.class_change', '1', true);
  update students set class_id = v_class.id, class_label = v_class.name where id = p_student;
end; $$;

revoke all on function staff_move_student(uuid, uuid) from public;
grant execute on function staff_move_student(uuid, uuid) to authenticated;
