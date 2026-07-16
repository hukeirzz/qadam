-- Copied verbatim from supabase/_archive/supabase_seed_topics.sql (data-only seed script).
-- NOT YET VERIFIED against the live project — this data almost certainly
-- already exists there (these files were run by hand via the SQL Editor).
-- Running this migration against a DB that already has the rows will fail
-- on primary-key conflicts; treat as historical record / reference until
-- reconciled with 'supabase db diff', or add ON CONFLICT DO NOTHING first.

-- Запусти в Supabase Dashboard → SQL Editor
-- Загружает все темы из приложения в таблицу topics

insert into topics (id, subject_id, title, order_num, xp_reward) values

-- Математика
('m1','math','Числа и операции',1,10),
('m2','math','Дроби и проценты',2,10),
('m3','math','Отношения и пропорции',3,10),
('m4','math','Степени и корни',4,10),
('m5','math','Уравнения и неравенства',5,10),
('m6','math','Функции',6,10),
('m7','math','Прогрессии',7,10),
('m8','math','Теория вероятностей',8,10),

-- Геометрия
('g1','geometry','Углы и треугольники',1,10),
('g2','geometry','Площади фигур',2,10),
('g3','geometry','Окружность',3,10),
('g4','geometry','Объёмы тел',4,10),
('g5','geometry','Координаты и векторы',5,10),
('g6','geometry','Теорема Пифагора',6,10),

-- Аналогии
('a1','analogies','Предмет и функция',1,10),
('a2','analogies','Часть и целое',2,10),
('a3','analogies','Причина и следствие',3,10),
('a4','analogies','Противоположности',4,10),
('a5','analogies','Место и деятель',5,10),
('a6','analogies','Числовые аналогии',6,10),

-- Чтение и понимание
('r1','reading','Главная мысль',1,10),
('r2','reading','Детали и факты',2,10),
('r3','reading','Умозаключения',3,10),
('r4','reading','Словарный запас',4,10),
('r5','reading','Тон и цель автора',5,10),
('r6','reading','Структура текста',6,10),

-- Грамматика
('gr1','grammar','Present Simple & Continuous',1,10),
('gr2','grammar','Past Simple & Continuous',2,10),
('gr3','grammar','Future tenses',3,10),
('gr4','grammar','Perfect tenses',4,10),
('gr5','grammar','Артикли',5,10),
('gr6','grammar','Модальные глаголы',6,10),
('gr7','grammar','Conditionals',7,10)

on conflict (id) do nothing;
