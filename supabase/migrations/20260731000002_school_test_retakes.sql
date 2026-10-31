-- Пересдача теста. В school_test_results (unique test_id+student_id) остаётся ТОЛЬКО первая
-- попытка — на ней построена вся аналитика (учитель и ученик). Все последующие попытки
-- пишутся сюда и ни в какую аналитику не попадают. Идемпотентно.

create table if not exists school_test_retakes (
  id               uuid primary key default gen_random_uuid(),
  test_id          uuid not null references school_tests(id) on delete cascade,
  student_id       uuid not null references students(id) on delete cascade,
  score            int not null,
  total            int not null,
  duration_seconds int,
  created_at       timestamptz default now()
);
create index if not exists idx_str_retakes_student_test on school_test_retakes(student_id, test_id);

-- total считается на сервере по числу вопросов, score ограничивается им (та же функция,
-- что и для первой попытки: она читает только NEW.test_id/score/total/duration_seconds).
drop trigger if exists trg_school_test_retake_normalize on school_test_retakes;
create trigger trg_school_test_retake_normalize
  before insert on school_test_retakes
  for each row execute function school_test_result_normalize();

alter table school_test_retakes enable row level security;
drop policy if exists "retakes_student_read" on school_test_retakes;
drop policy if exists "retakes_student_insert" on school_test_retakes;
drop policy if exists "retakes_staff_read" on school_test_retakes;

create policy "retakes_student_read" on school_test_retakes for select
  using (auth.uid() = student_id);

-- Пересдавать можно только тест, который ученик уже сдавал в первый раз и который ему назначен.
create policy "retakes_student_insert" on school_test_retakes for insert
  with check (
    auth.uid() = student_id
    and can_student_see_school_test(test_id)
    and exists (select 1 from school_test_results r where r.test_id = school_test_retakes.test_id and r.student_id = auth.uid())
  );

create policy "retakes_staff_read" on school_test_retakes for select
  using (staff_owns_school_test(test_id));
