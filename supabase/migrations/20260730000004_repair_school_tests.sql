-- Ремонт: в живой базе есть school_test_questions / school_test_results /
-- school_test_students, но нет school_tests и school_test_options (частично
-- применённые миграции 20260729000003/04/06). Приводим всё к итоговой схеме:
-- тест назначается конкретным ученикам, без рангов. Идемпотентно.
-- Требует уже существующих schools, staff, students, subjects и функций
-- is_staff() / current_school_id() (из backend_v2_rls).

create table if not exists school_tests (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  title       text not null,
  description text,
  subject_id  text references subjects(id),
  topic_id    text,
  -- тест виден ученикам только после того, как записаны все вопросы и варианты
  published   boolean not null default false,
  created_by  uuid references staff(id),
  created_at  timestamptz default now()
);
create index if not exists idx_school_tests_school on school_tests(school_id);

create table if not exists school_test_questions (
  id          uuid primary key default gen_random_uuid(),
  test_id     uuid not null,
  order_num   int not null default 0,
  text        text not null,
  explanation text
);
create table if not exists school_test_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references school_test_questions(id) on delete cascade,
  order_num   int not null default 0,
  text        text not null,
  is_correct  boolean not null default false
);
create table if not exists school_test_results (
  id               uuid primary key default gen_random_uuid(),
  test_id          uuid not null,
  student_id       uuid not null references students(id) on delete cascade,
  score            int not null,
  total            int not null,
  duration_seconds int,
  created_at       timestamptz default now(),
  unique (test_id, student_id)
);
create table if not exists school_test_students (
  test_id    uuid not null,
  student_id uuid not null references students(id) on delete cascade,
  primary key (test_id, student_id)
);
alter table school_tests        add column if not exists topic_id text;
alter table school_test_results add column if not exists duration_seconds int;

create index if not exists idx_stq_test on school_test_questions(test_id);
create index if not exists idx_sto_question on school_test_options(question_id);
create index if not exists idx_str_test on school_test_results(test_id);
create index if not exists idx_str_student on school_test_results(student_id);
create index if not exists idx_sts2_student on school_test_students(student_id);

-- Строки, чьи тесты потеряны (school_tests не было), всё равно не открыть —
-- убираем их, иначе внешний ключ не добавить.
delete from school_test_questions where test_id not in (select id from school_tests);
delete from school_test_results   where test_id not in (select id from school_tests);
delete from school_test_students  where test_id not in (select id from school_tests);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'fk_stq_test') then
    alter table school_test_questions
      add constraint fk_stq_test foreign key (test_id) references school_tests(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_str_test') then
    alter table school_test_results
      add constraint fk_str_test foreign key (test_id) references school_tests(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fk_sts_test') then
    alter table school_test_students
      add constraint fk_sts_test foreign key (test_id) references school_tests(id) on delete cascade;
  end if;
end $$;

-- Функции видимости (SECURITY DEFINER обходит RLS и разрывает циклы политик).
create or replace function staff_owns_school_test(p_test uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from school_tests t join staff st on st.id = auth.uid()
    where t.id = p_test and t.school_id = st.school_id and st.school_id is not null
  );
$$;

create or replace function can_student_see_school_test(p_test uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from school_tests t
    join students s on s.id = auth.uid()
    join school_test_students a on a.test_id = t.id and a.student_id = s.id
    where t.id = p_test
      and t.published
      and t.school_id = s.school_id
  );
$$;

grant execute on function can_student_see_school_test(uuid) to authenticated;
grant execute on function staff_owns_school_test(uuid) to authenticated;

-- total и границы score перепроверяем на сервере.
create or replace function school_test_result_normalize()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select count(*) into new.total from school_test_questions q where q.test_id = new.test_id;
  new.score := greatest(0, least(coalesce(new.score, 0), new.total));
  if new.duration_seconds is not null then
    new.duration_seconds := greatest(0, new.duration_seconds);
  end if;
  return new;
end; $$;
drop trigger if exists trg_school_test_result_normalize on school_test_results;
create trigger trg_school_test_result_normalize
  before insert on school_test_results
  for each row execute function school_test_result_normalize();

-- RLS.
alter table school_tests enable row level security;
drop policy if exists "school_tests_staff_all" on school_tests;
drop policy if exists "school_tests_student_read" on school_tests;
create policy "school_tests_staff_all" on school_tests for all
  using      (is_staff() and school_id = current_school_id())
  with check (is_staff() and school_id = current_school_id());
create policy "school_tests_student_read" on school_tests for select
  using (can_student_see_school_test(id));

alter table school_test_students enable row level security;
drop policy if exists "school_test_students_staff_all" on school_test_students;
create policy "school_test_students_staff_all" on school_test_students for all
  using (staff_owns_school_test(test_id)) with check (staff_owns_school_test(test_id));

alter table school_test_questions enable row level security;
drop policy if exists "school_test_questions_staff_all" on school_test_questions;
drop policy if exists "school_test_questions_student_read" on school_test_questions;
create policy "school_test_questions_staff_all" on school_test_questions for all
  using (staff_owns_school_test(test_id)) with check (staff_owns_school_test(test_id));
create policy "school_test_questions_student_read" on school_test_questions for select
  using (can_student_see_school_test(test_id));

alter table school_test_options enable row level security;
drop policy if exists "school_test_options_staff_all" on school_test_options;
drop policy if exists "school_test_options_student_read" on school_test_options;
create policy "school_test_options_staff_all" on school_test_options for all
  using (exists (select 1 from school_test_questions q
                  where q.id = school_test_options.question_id
                    and staff_owns_school_test(q.test_id)))
  with check (exists (select 1 from school_test_questions q
                       where q.id = school_test_options.question_id
                         and staff_owns_school_test(q.test_id)));
create policy "school_test_options_student_read" on school_test_options for select
  using (exists (select 1 from school_test_questions q
                  where q.id = school_test_options.question_id
                    and can_student_see_school_test(q.test_id)));

alter table school_test_results enable row level security;
drop policy if exists "school_test_results_staff_read" on school_test_results;
drop policy if exists "school_test_results_student_read" on school_test_results;
drop policy if exists "school_test_results_student_insert" on school_test_results;
create policy "school_test_results_staff_read" on school_test_results for select
  using (staff_owns_school_test(test_id));
create policy "school_test_results_student_read" on school_test_results for select
  using (auth.uid() = student_id);
create policy "school_test_results_student_insert" on school_test_results for insert
  with check (auth.uid() = student_id and can_student_see_school_test(test_id));
