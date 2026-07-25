-- Backend v2 — часть 1: разделы, промокоды, practice/theory, разделение
-- пользователей (staff/students), точность по темам, пробные экзамены.
-- Применено к живому проекту через MCP 2026-07-25.

create table if not exists subjects (
  id text primary key,
  name text not null,
  order_num int not null default 0
);
insert into subjects (id, name, order_num) values
  ('math','Математика',1),
  ('geometry','Геометрия',2),
  ('grammar','Грамматика',3),
  ('analogies','Аналогии',4),
  ('reading','Чтение и понимание',5)
on conflict (id) do nothing;

alter table schools add column if not exists promo_code text unique;

alter table questions
  add column if not exists kind text not null default 'practice'
    check (kind in ('practice','theory'));

create table if not exists staff (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  role       text not null check (role in ('coordinator','admin','director')),
  school_id  uuid references schools(id),
  created_at timestamptz default now()
);

insert into staff (id, name, role, school_id)
  select id, name, role, school_id from user_profiles
  where role in ('coordinator','admin','director')
  on conflict (id) do nothing;
delete from user_profiles where role in ('coordinator','admin','director');

drop policy if exists "Staff can read own-school student profiles" on user_profiles;

alter table user_profiles rename to students;
alter table students drop column if exists role;
alter table students
  add column if not exists rank text not null default 'D'
    check (rank in ('D','C','B','A','S')),
  add column if not exists premium_source text not null default 'none'
    check (premium_source in ('none','school','paid'));

create table if not exists student_topic_stats (
  student_id    uuid not null references students(id) on delete cascade,
  topic_id      text not null,
  subject_id    text not null,
  correct_first int not null default 0,
  answered      int not null default 0,
  updated_at    timestamptz default now(),
  primary key (student_id, topic_id)
);
create index if not exists idx_sts_student on student_topic_stats(student_id);
create index if not exists idx_sts_subject on student_topic_stats(subject_id);

create table if not exists mock_exams (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references schools(id) on delete cascade,
  name       text not null,
  exam_date  date,
  created_by uuid references staff(id),
  created_at timestamptz default now()
);
create table if not exists mock_results (
  id         uuid primary key default gen_random_uuid(),
  exam_id    uuid not null references mock_exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  math int, geometry int, grammar int, analogies int, reading int,
  total      int not null,
  created_at timestamptz default now(),
  unique (exam_id, student_id)
);
create index if not exists idx_mr_student on mock_results(student_id);
create index if not exists idx_mr_exam on mock_results(exam_id);
