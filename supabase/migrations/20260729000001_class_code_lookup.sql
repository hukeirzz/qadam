-- classes.promo_code (backend_v2_tables) has no student-facing lookup yet —
-- same schools_read/classes_read chicken-and-egg problem as
-- public_find_school_by_code (20260728000003): a student without a
-- school/class link can't read a classes row to resolve the code they just
-- typed in. Mirrors that fix: security definer, exposes only id/name/
-- school_id (not promo_code), so codes stay non-enumerable. Returning
-- school_id lets the app link a student to their school from the class
-- code alone, without also requiring a separate school code.
create or replace function public_find_class_by_code(p_code text)
returns table(id uuid, name text, school_id uuid)
language sql security definer stable set search_path = public as $$
  select id, name, school_id from classes where promo_code ilike p_code;
$$;

grant execute on function public_find_class_by_code(text) to authenticated;
