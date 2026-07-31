-- Возврат к исходному UX мастера создания теста в school-web: тест
-- назначается конкретным выбранным ученикам класса (с подсказкой
-- «рекомендованных» по слабой точности темы), а не всей школе/классу/
-- рангу целиком. school_test_classes/target_rank остаются в схеме, но
-- видимость теперь решает только явное назначение ученику.
create table if not exists school_test_students (
  test_id    uuid not null references school_tests(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (test_id, student_id)
);
create index if not exists idx_sts2_student on school_test_students(student_id);

-- Тема (не только раздел) — старый визард генерирует заготовки вопросов
-- под конкретную тему, а не просто раздел; нужно хранить это для истории/
-- заголовка.
alter table school_tests add column if not exists topic_id text;

alter table school_test_students enable row level security;
drop policy if exists "school_test_students_staff_all" on school_test_students;
create policy "school_test_students_staff_all" on school_test_students for all
  using (staff_owns_school_test(test_id)) with check (staff_owns_school_test(test_id));
-- Ученикам читать нечего: видимость решается внутри
-- can_student_see_school_test (SECURITY DEFINER, обходит эту RLS).

-- Видимость — теперь только явное назначение (+ обязательная проверка
-- школы на случай, если координатор ошибочно назначит чужого ученика).
-- target_rank/subject_id/topic_id остаются чисто информационными полями
-- для UI, а не фильтром видимости — назначение не должно «слетать», если
-- у ученика впоследствии поменялся ранг.
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

-- Бэкфилл для двух уже созданных тестов, чтобы не «ослепнуть» после
-- смены модели видимости: у кого было назначение через класс — переносим
-- в явный список; у кого класса не было (значит был виден всей школе) —
-- назначаем всех учеников школы.
insert into school_test_students (test_id, student_id)
select t.id, s.id
from school_tests t
join students s on s.school_id = t.school_id
where exists (select 1 from school_test_classes c where c.test_id = t.id)
  and s.class_id in (select class_id from school_test_classes c where c.test_id = t.id)
on conflict do nothing;

insert into school_test_students (test_id, student_id)
select t.id, s.id
from school_tests t
join students s on s.school_id = t.school_id
where not exists (select 1 from school_test_classes c where c.test_id = t.id)
on conflict do nothing;
