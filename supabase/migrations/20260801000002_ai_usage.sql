-- Учёт ИИ-генерации вопросов: кто, сколько и за сколько токенов запросил.
-- По этой таблице считаем расход и ограничиваем число генераций школы за сутки. Идемпотентно.
create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  user_id uuid not null,
  kind text not null,
  subject_id text,
  topic_title text,
  level text,
  requested int not null,
  produced int not null,
  dropped jsonb,
  models text[],
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  cache_write_tokens int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_school_day on ai_usage (school_id, created_at desc);

alter table ai_usage enable row level security;

drop policy if exists ai_usage_staff_select on ai_usage;
create policy ai_usage_staff_select on ai_usage for select
  using (is_staff() and school_id = current_school_id());

drop policy if exists ai_usage_staff_insert on ai_usage;
create policy ai_usage_staff_insert on ai_usage for insert
  with check (is_staff() and school_id = current_school_id() and user_id = auth.uid());
