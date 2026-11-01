-- Ученик может сменить класс только по коду класса.
--  * change_class_by_code(code) — переводит текущего ученика в класс (и его школу) по коду.
--  * триггер students_lock_class запрещает менять class_id / school_id / class_label напрямую
--    (RLS разрешает ученику обновлять свою строку целиком, иначе «по коду» можно обойти).
--    Исключения: сама функция (она ставит флаг на время транзакции), учителя (is_staff) и
--    служебные запросы без пользователя (SQL Editor, миграции).
-- Идемпотентно.

create or replace function change_class_by_code(p_code text)
returns table(class_name text, school_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_class classes%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_class from classes
  where upper(promo_code) = upper(trim(coalesce(p_code, '')))
  limit 1;
  if not found then
    raise exception 'invalid_class_code';
  end if;

  perform set_config('qadam.class_change', '1', true); -- только для этой транзакции
  update students
     set class_id = v_class.id, school_id = v_class.school_id, class_label = v_class.name
   where id = auth.uid();

  return query select v_class.name, (select s.name from schools s where s.id = v_class.school_id);
end; $$;
grant execute on function change_class_by_code(text) to authenticated;

create or replace function students_lock_class()
returns trigger language plpgsql as $$
begin
  if (new.class_id is distinct from old.class_id
      or new.school_id is distinct from old.school_id
      or new.class_label is distinct from old.class_label)
     and auth.uid() is not null
     and not is_staff()
     and coalesce(current_setting('qadam.class_change', true), '') <> '1' then
    raise exception 'class_change_requires_code';
  end if;
  return new;
end; $$;

drop trigger if exists students_lock_class on students;
create trigger students_lock_class
  before update on students
  for each row execute function students_lock_class();
