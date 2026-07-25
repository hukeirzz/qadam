-- Backend v2 — часть 3: RLS, helper-функции на основе staff, роутинг новых
-- auth-юзеров (staff/student по metadata.account_type), промокод демо-школе.
-- Применено к живому проекту через MCP 2026-07-25.

create or replace function current_school_id()
returns uuid language sql security definer stable set search_path = public as $$
  select school_id from staff where id = auth.uid();
$$;
create or replace function is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from staff where id = auth.uid());
$$;

drop function if exists current_user_role() cascade;
drop function if exists current_user_school_id() cascade;

do $$ declare r record; begin
  for r in select policyname from pg_policies where schemaname='public' and tablename='students' loop
    execute format('drop policy if exists %I on students', r.policyname);
  end loop;
end $$;
alter table students enable row level security;
create policy "student_select_own" on students for select using (auth.uid() = id);
create policy "student_update_own" on students for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "student_insert_own" on students for insert with check (auth.uid() = id);
create policy "staff_select_school_students" on students for select using (is_staff() and school_id = current_school_id());

alter table staff enable row level security;
drop policy if exists "staff_select_own" on staff;
create policy "staff_select_own" on staff for select using (auth.uid() = id);

alter table schools enable row level security;
drop policy if exists "schools_read" on schools;
create policy "schools_read" on schools for select using (
  id = current_school_id() or id = (select school_id from students where id = auth.uid())
);
alter table classes enable row level security;
drop policy if exists "classes_read" on classes;
create policy "classes_read" on classes for select using (
  school_id = current_school_id() or school_id = (select school_id from students where id = auth.uid())
);

alter table subjects enable row level security;
drop policy if exists "subjects_read" on subjects;
create policy "subjects_read" on subjects for select using (true);

alter table student_topic_stats enable row level security;
drop policy if exists "sts_student_all" on student_topic_stats;
drop policy if exists "sts_staff_read" on student_topic_stats;
create policy "sts_student_all" on student_topic_stats for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "sts_staff_read" on student_topic_stats for select using (
  is_staff() and exists(select 1 from students s where s.id = student_topic_stats.student_id and s.school_id = current_school_id())
);

alter table mock_exams enable row level security;
drop policy if exists "exams_staff_all" on mock_exams;
drop policy if exists "exams_student_read" on mock_exams;
create policy "exams_staff_all" on mock_exams for all using (is_staff() and school_id = current_school_id()) with check (is_staff() and school_id = current_school_id());
create policy "exams_student_read" on mock_exams for select using (school_id = (select school_id from students where id = auth.uid()));

alter table mock_results enable row level security;
drop policy if exists "results_staff_all" on mock_results;
drop policy if exists "results_student_read" on mock_results;
create policy "results_staff_all" on mock_results for all using (
  is_staff() and exists(select 1 from mock_exams e where e.id = mock_results.exam_id and e.school_id = current_school_id())
) with check (
  is_staff() and exists(select 1 from mock_exams e where e.id = mock_results.exam_id and e.school_id = current_school_id())
);
create policy "results_student_read" on mock_results for select using (auth.uid() = student_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_user_meta_data->>'account_type','student') = 'staff' then
    insert into public.staff (id, name, role, school_id)
    values (new.id,
            coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
            coalesce(new.raw_user_meta_data->>'role','coordinator'),
            null)
    on conflict (id) do nothing;
  else
    insert into public.students (id, name, streak, gems, xp, premium_unlocked)
    values (new.id,
            coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
            0, 0, 0, false)
    on conflict (id) do nothing;
  end if;
  return new;
end; $$;

update schools set promo_code = 'BILIM2026'
  where name = 'Международная школа Билимкана' and promo_code is null;
