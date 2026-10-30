-- Три уровня сложности: Базовый / Средний / Высокий.
--  * у школьного теста появляется уровень;
--  * topic_levels — какие темы входят в какой уровень (тема может быть в
--    одном, двух или трёх уровнях: «не все темы попадают вниз или вверх»).
--    По умолчанию заполняется всеми темами во всех уровнях — лишние пары
--    (тема, уровень) просто удаляются.
-- Тепловая карта уровня в профиле ученика считается по результатам школьных
-- тестов этого уровня и темы (school_test_results.score / total).

alter table school_tests
  add column if not exists level text not null default 'medium'
    check (level in ('basic', 'medium', 'high'));

create table if not exists topic_levels (
  topic_id text not null references topics(id) on delete cascade,
  level    text not null check (level in ('basic', 'medium', 'high')),
  primary key (topic_id, level)
);
create index if not exists idx_topic_levels_level on topic_levels(level);

insert into topic_levels (topic_id, level)
select t.id, l.level
from topics t
cross join (values ('basic'), ('medium'), ('high')) as l(level)
on conflict do nothing;

alter table topic_levels enable row level security;
drop policy if exists "topic_levels_read" on topic_levels;
create policy "topic_levels_read" on topic_levels for select
  to authenticated using (true);
-- Запись — только вручную через SQL/сервисный ключ: политик на insert/update/delete нет.
