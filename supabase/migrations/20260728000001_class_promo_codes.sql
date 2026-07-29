-- Per-class promo codes: a student joins a specific class by entering its
-- code. Staff can create classes (code auto-generated) and regenerate a
-- class's code (e.g. if it leaked). Applied to the live project via MCP.

-- Random 6-char code from an unambiguous alphabet (no 0/O/1/I). SECURITY
-- DEFINER so the global-uniqueness check sees classes across all schools,
-- not just the caller's (RLS-visible) own — otherwise a collision with
-- another school's code could still violate the unique constraint.
create or replace function gen_promo_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from classes where promo_code = code);
  end loop;
  return code;
end; $$;

alter table classes add column if not exists promo_code text unique;
alter table classes alter column promo_code set default gen_promo_code();
update classes set promo_code = gen_promo_code() where promo_code is null;

-- Staff may create / update classes in their own school (read policy already
-- exists from backend_v2_rls as "classes_read").
drop policy if exists "classes_staff_insert" on classes;
create policy "classes_staff_insert" on classes
  for insert with check (is_staff() and school_id = current_school_id());

drop policy if exists "classes_staff_update" on classes;
create policy "classes_staff_update" on classes
  for update using (is_staff() and school_id = current_school_id())
  with check (is_staff() and school_id = current_school_id());

-- Regenerate a class code. Runs as invoker so the classes UPDATE policy above
-- governs who may call it; returns the new code.
create or replace function regenerate_class_code(p_class uuid)
returns text language sql as $$
  update classes set promo_code = gen_promo_code() where id = p_class returning promo_code;
$$;
