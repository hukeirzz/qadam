-- Ученик регистрируется на сайте сам: email + пароль + код класса.
--  * check_class_code(code) — публичная (anon) проверка кода до регистрации:
--    отдаёт только название класса и школы, сами коды остаются непубличными.
--  * handle_new_user теперь читает class_code из метаданных регистрации и
--    сразу кладёт ученика в класс и школу (работает и когда подтверждение
--    email включено, т.е. сессии на момент регистрации ещё нет).
-- Идемпотентно.

create or replace function check_class_code(p_code text)
returns table(class_name text, school_name text)
language sql security definer stable set search_path = public as $$
  select c.name, s.name
  from classes c join schools s on s.id = c.school_id
  where upper(c.promo_code) = upper(trim(p_code))
  limit 1;
$$;
grant execute on function check_class_code(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_class classes%rowtype;
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1));
begin
  if coalesce(new.raw_user_meta_data->>'account_type', 'student') = 'staff' then
    insert into public.staff (id, name, role, school_id)
    values (new.id, v_name, coalesce(new.raw_user_meta_data->>'role', 'coordinator'), null)
    on conflict (id) do nothing;
  else
    select * into v_class from classes
    where upper(promo_code) = upper(trim(coalesce(new.raw_user_meta_data->>'class_code', '')))
    limit 1;

    insert into public.students (id, name, class_id, school_id, class_label, data_consent)
    values (new.id, v_name, v_class.id, v_class.school_id, v_class.name, true)
    on conflict (id) do nothing;
  end if;
  return new;
end; $$;
