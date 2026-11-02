-- Учитель удаляет ученика своей школы. Аккаунт живёт в auth.users, а клиенту его удалять нельзя,
-- поэтому — SECURITY DEFINER-функция с проверками. Удаление каскадно уносит строку students и всё,
-- что на неё ссылается (результаты тестов, пересдачи, назначения, пробные, статистику по темам).
-- Идемпотентно.

create or replace function staff_delete_student(p_student uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then
    raise exception 'not_staff';
  end if;

  -- только ученик из школы вызывающего учителя
  if not exists (select 1 from students where id = p_student and school_id = current_school_id()) then
    raise exception 'student_not_found';
  end if;

  delete from auth.users where id = p_student;
end; $$;

revoke all on function staff_delete_student(uuid) from public;
grant execute on function staff_delete_student(uuid) to authenticated;
