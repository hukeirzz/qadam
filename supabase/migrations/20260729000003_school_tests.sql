-- Тесты, которые координатор пишет вручную в school-web и которые
-- автоматически появляются у учеников своей школы в приложении (по
-- желанию — ограниченные конкретным рангом и/или классами). Отдельные
-- таблицы, а не questions/options: тот банк — глобальный, без school_id,
-- и его читает practice/вступительный тест у всех учеников подряд, так что
-- подмешивать туда контент одной школы нельзя.

create table if not exists school_tests (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  title       text not null,
  description text,
  -- null = виден ученикам любого ранга
  target_rank text check (target_rank in ('D','C','B','A','S')),
  -- необязательная привязка к разделу ОРТ — только для фильтра на экране
  -- списка тестов; null = «без раздела»
  subject_id  text references subjects(id),
  -- supabase-js не даёт транзакций, поэтому вставки (тест → вопросы →
  -- варианты) идут последовательно; тест виден ученикам только после того,
  -- как все вопросы и варианты успешно записаны
  published   boolean not null default false,
  created_by  uuid references staff(id),
  created_at  timestamptz default now()
);
create index if not exists idx_school_tests_school on school_tests(school_id);

-- Ограничение по классам. Нет ни одной строки для теста => виден всей школе.
create table if not exists school_test_classes (
  test_id  uuid not null references school_tests(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  primary key (test_id, class_id)
);

create table if not exists school_test_questions (
  id          uuid primary key default gen_random_uuid(),
  test_id     uuid not null references school_tests(id) on delete cascade,
  order_num   int not null default 0,
  text        text not null,
  explanation text
);
create index if not exists idx_stq_test on school_test_questions(test_id);

create table if not exists school_test_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references school_test_questions(id) on delete cascade,
  order_num   int not null default 0,
  text        text not null,
  is_correct  boolean not null default false
);
create index if not exists idx_sto_question on school_test_options(question_id);

create table if not exists school_test_results (
  id         uuid primary key default gen_random_uuid(),
  test_id    uuid not null references school_tests(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  score      int not null,
  total      int not null,
  created_at timestamptz default now(),
  unique (test_id, student_id) -- одна попытка на ученика
);
create index if not exists idx_str_test on school_test_results(test_id);
create index if not exists idx_str_student on school_test_results(student_id);

-- Виден ли тест текущему ученику. SECURITY DEFINER не ради краткости:
-- политике school_tests нужно заглянуть в school_test_classes, а политике
-- school_test_classes — обратно в school_tests. Подзапросы внутри RLS-
-- политик сами подчиняются RLS, так что «в лоб» это дало бы 42P17
-- (infinite recursion in policy). Функция обходит RLS и разрывает цикл —
-- тот же приём, что current_school_id()/is_staff() (backend_v2_rls.sql) и
-- public_find_school_by_code/public_find_class_by_code.
create or replace function can_student_see_school_test(p_test uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from school_tests t
    join students s on s.id = auth.uid()
    where t.id = p_test
      and t.published
      and t.school_id = s.school_id
      and s.school_id is not null
      and (t.target_rank is null or t.target_rank = s.rank)
      and (
        not exists (select 1 from school_test_classes c where c.test_id = t.id)
        or exists (select 1 from school_test_classes c
                    where c.test_id = t.id and c.class_id = s.class_id)
      )
  );
$$;

-- Тот же приём для персонала: тест принадлежит школе вызывающего сотрудника.
create or replace function staff_owns_school_test(p_test uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from school_tests t join staff st on st.id = auth.uid()
    where t.id = p_test and t.school_id = st.school_id and st.school_id is not null
  );
$$;

grant execute on function can_student_see_school_test(uuid) to authenticated;
grant execute on function staff_owns_school_test(uuid) to authenticated;

-- Клиент присылает свой счёт (как и весь остальной XP в проекте), но total
-- и границы score всё равно перепроверяем на сервере.
create or replace function school_test_result_normalize()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select count(*) into new.total from school_test_questions q where q.test_id = new.test_id;
  new.score := greatest(0, least(coalesce(new.score, 0), new.total));
  return new;
end; $$;

drop trigger if exists trg_school_test_result_normalize on school_test_results;
create trigger trg_school_test_result_normalize
  before insert on school_test_results
  for each row execute function school_test_result_normalize();

alter table school_tests enable row level security;
drop policy if exists "school_tests_staff_all" on school_tests;
drop policy if exists "school_tests_student_read" on school_tests;
create policy "school_tests_staff_all" on school_tests for all
  using      (is_staff() and school_id = current_school_id())
  with check (is_staff() and school_id = current_school_id());
create policy "school_tests_student_read" on school_tests for select
  using (can_student_see_school_test(id));

alter table school_test_classes enable row level security;
drop policy if exists "school_test_classes_staff_all" on school_test_classes;
create policy "school_test_classes_staff_all" on school_test_classes for all
  using (staff_owns_school_test(test_id)) with check (staff_owns_school_test(test_id));
-- ученикам читать нечего: видимость уже решена внутри
-- can_student_see_school_test, поэтому список целевых классов не раскрываем.

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
-- только INSERT: без политик UPDATE/DELETE переписать свой результат
-- нельзя, а повторная отправка упирается в unique(test_id, student_id).
create policy "school_test_results_student_insert" on school_test_results for insert
  with check (auth.uid() = student_id and can_student_see_school_test(test_id));
