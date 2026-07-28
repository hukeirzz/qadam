-- 1) class_label/data_consent, как pet_name/pet_type в 20260728000002, были
--    добавлены к старой user_profiles но не пережили переименование в
--    students — экран регистрации/настроек молча не сохранял их.
alter table students
  add column if not exists class_label  text,
  add column if not exists data_consent boolean not null default false;

-- 2) schools_read (20260725000003) разрешает читать школу только тому, кто
--    уже в неё записан — то есть findByCode("код школы") при регистрации
--    не находил вообще ничего: чтобы узнать school.id по коду, нужно уже
--    иметь school_id, а чтобы получить school_id, нужно сначала найти
--    школу. RPC с security definer обходит RLS, отдавая только id/name
--    (не promo_code), так что коды остаются непубличными.
create or replace function public_find_school_by_code(p_code text)
returns table(id uuid, name text)
language sql security definer stable set search_path = public as $$
  select id, name from schools where promo_code ilike p_code;
$$;

grant execute on function public_find_school_by_code(text) to authenticated;
