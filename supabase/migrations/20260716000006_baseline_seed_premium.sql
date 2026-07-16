-- Copied verbatim from supabase/_archive/supabase_seed_premium.sql (data-only seed script).
-- NOT YET VERIFIED against the live project — this data almost certainly
-- already exists there (these files were run by hand via the SQL Editor).
-- Running this migration against a DB that already has the rows will fail
-- on primary-key conflicts; treat as historical record / reference until
-- reconciled with 'supabase db diff', or add ON CONFLICT DO NOTHING first.

-- ══════════════════════════════════════════════════════════════
-- ПРЕМИУМ-ОСТРОВА: по 1 теме и 10 вопросов на каждый остров
-- Запусти в Supabase Dashboard → SQL Editor
-- subject_id: math_premium / geometry_premium / analogies_premium /
--             reading_premium / grammar_premium
-- ══════════════════════════════════════════════════════════════

-- ── 1. ТЕМЫ (по одной на каждый премиум-остров) ───────────────
insert into topics (id, subject_id, title, order_num, xp_reward) values
('pmath1','math_premium','Продвинутая математика',1,15),
('pgeom1','geometry_premium','Продвинутая геометрия',1,15),
('panalog1','analogies_premium','Продвинутые аналогии',1,15),
('pread1','reading_premium','Продвинутое чтение',1,15),
('pgram1','grammar_premium','Продвинутая грамматика',1,15)
on conflict (id) do nothing;

-- ── 2. ВОПРОСЫ (10 на каждый остров) ──────────────────────────
insert into questions (id, topic_id, subject_id, text, explanation, xp_reward) values
-- Математика (премиум)
('q-pmath-1','pmath1','math_premium','Значение √(9² + 12²) равно:','√(81+144)=√225=15.',15),
('q-pmath-2','pmath1','math_premium','Реши уравнение: 5x − 3 = 2x + 12','3x = 15 → x = 5.',15),
('q-pmath-3','pmath1','math_premium','20% некоторого числа равно 50. Найди это число.','50 ÷ 0.2 = 250.',15),
('q-pmath-4','pmath1','math_premium','Вычисли: (2/3) ÷ (4/9)','(2/3)×(9/4)=18/12=3/2.',15),
('q-pmath-5','pmath1','math_premium','Сумма первых 10 натуральных чисел (1..10):','10×11/2 = 55.',15),
('q-pmath-6','pmath1','math_premium','Чему равно 7! / 5!?','7×6 = 42.',15),
('q-pmath-7','pmath1','math_premium','Сколько процентов составляет 18 от 24?','18/24 = 0.75 = 75%.',15),
('q-pmath-8','pmath1','math_premium','Среднее арифметическое чисел 12, 15, 18, 21:','(12+15+18+21)/4 = 66/4 = 16.5.',15),
('q-pmath-9','pmath1','math_premium','Если a : b = 2 : 3 и b = 12, то a равно:','a = 12×2/3 = 8.',15),
('q-pmath-10','pmath1','math_premium','Чему равно 2¹⁰?','2 в 10-й степени = 1024.',15),

-- Геометрия (премиум)
('q-pgeom-1','pgeom1','geometry_premium','Площадь круга с радиусом 10 (π ≈ 3.14):','S = πr² = 3.14×100 = 314.',15),
('q-pgeom-2','pgeom1','geometry_premium','Гипотенуза прямоугольного треугольника с катетами 6 и 8:','√(36+64)=√100=10.',15),
('q-pgeom-3','pgeom1','geometry_premium','Сумма углов выпуклого четырёхугольника:','(4−2)×180° = 360°.',15),
('q-pgeom-4','pgeom1','geometry_premium','Объём куба со стороной 4:','4³ = 64.',15),
('q-pgeom-5','pgeom1','geometry_premium','Площадь треугольника с основанием 10 и высотой 6:','(10×6)/2 = 30.',15),
('q-pgeom-6','pgeom1','geometry_premium','Длина окружности с диаметром 14 (π ≈ 3.14):','C = πd = 3.14×14 = 43.96.',15),
('q-pgeom-7','pgeom1','geometry_premium','Площадь параллелограмма с основанием 8 и высотой 5:','S = 8×5 = 40.',15),
('q-pgeom-8','pgeom1','geometry_premium','Объём цилиндра при r = 3, h = 10 (π ≈ 3.14):','V = πr²h = 3.14×9×10 = 282.6.',15),
('q-pgeom-9','pgeom1','geometry_premium','Внешний угол правильного шестиугольника:','360° / 6 = 60°.',15),
('q-pgeom-10','pgeom1','geometry_premium','Диагональ квадрата со стороной 5 (√2 ≈ 1.41):','5×1.41 ≈ 7.05.',15),

-- Аналогии (премиум)
('q-panalog-1','panalog1','analogies_premium','Слово : Предложение = Кирпич : ?','Из слов строят предложение, из кирпичей — стену.',15),
('q-panalog-2','panalog1','analogies_premium','Термометр : Температура = Часы : ?','Прибор и то, что он измеряет.',15),
('q-panalog-3','panalog1','analogies_premium','Поэт : Стихотворение = Композитор : ?','Автор и его произведение.',15),
('q-panalog-4','panalog1','analogies_premium','Засуха : Дождь = Голод : ?','Засуху устраняет дождь, голод — еда.',15),
('q-panalog-5','panalog1','analogies_premium','Капитан : Корабль = Пилот : ?','Кто управляет и чем.',15),
('q-panalog-6','panalog1','analogies_premium','Библиотека : Книги = Музей : ?','Что хранится в учреждении.',15),
('q-panalog-7','panalog1','analogies_premium','Семя : Растение = Яйцо : ?','Из семени растёт растение, из яйца — птенец.',15),
('q-panalog-8','panalog1','analogies_premium','Ключ : Замок = Код : ?','Чем открывают.',15),
('q-panalog-9','panalog1','analogies_premium','Художник : Кисть = Писатель : ?','Инструмент мастера.',15),
('q-panalog-10','panalog1','analogies_premium','Жара : Пот = Холод : ?','Реакция тела на температуру.',15),

-- Чтение и понимание (премиум) — словарный запас
('q-pread-1','pread1','reading_premium','Синоним слова «лаконичный»:','Лаконичный = краткий, немногословный.',15),
('q-pread-2','pread1','reading_premium','Антоним слова «щедрый»:','Противоположность щедрости — скупость.',15),
('q-pread-3','pread1','reading_premium','Что означает слово «апеллировать»?','Апеллировать = обращаться, призывать.',15),
('q-pread-4','pread1','reading_premium','Синоним слова «эфемерный»:','Эфемерный = недолговечный, мимолётный.',15),
('q-pread-5','pread1','reading_premium','Антоним слова «архаичный»:','Архаичный = устаревший; антоним — современный.',15),
('q-pread-6','pread1','reading_premium','«Скрупулёзный» означает:','Скрупулёзный = очень тщательный, внимательный к деталям.',15),
('q-pread-7','pread1','reading_premium','Синоним слова «амбициозный»:','Амбициозный = честолюбивый.',15),
('q-pread-8','pread1','reading_premium','Что значит «нивелировать»?','Нивелировать = сглаживать, устранять различия.',15),
('q-pread-9','pread1','reading_premium','Антоним слова «оптимист»:','Оптимист ↔ пессимист.',15),
('q-pread-10','pread1','reading_premium','«Меланхоличный» означает:','Меланхоличный = грустный, задумчиво-печальный.',15),

-- Грамматика (премиум) — English advanced
('q-pgram-1','pgram1','grammar_premium','If I ___ rich, I would travel the world.','Second conditional: were для всех лиц.',15),
('q-pgram-2','pgram1','grammar_premium','She has ___ finished her homework.','Present Perfect: already в утверждении.',15),
('q-pgram-3','pgram1','grammar_premium','This novel ___ by millions of people.','Passive (Present Perfect): has been read.',15),
('q-pgram-4','pgram1','grammar_premium','By next June, I ___ here for ten years.','Future Perfect: will have + V3.',15),
('q-pgram-5','pgram1','grammar_premium','I wish I ___ taller.','После I wish (о настоящем) — were.',15),
('q-pgram-6','pgram1','grammar_premium','He suggested ___ a short break.','После suggest — герундий (-ing).',15),
('q-pgram-7','pgram1','grammar_premium','Neither of the answers ___ correct.','Neither + of + сущ. → глагол в ед. числе: is.',15),
('q-pgram-8','pgram1','grammar_premium','The more you practice, the ___ you become.','Конструкция the more… the better.',15),
('q-pgram-9','pgram1','grammar_premium','___ I known earlier, I would have helped.','Инверсия 3-го кондишена: Had I known…',15),
('q-pgram-10','pgram1','grammar_premium','It''s high time we ___ home.','It''s high time + Past Simple: went.',15)
on conflict (id) do nothing;

-- ── 3. ВАРИАНТЫ ОТВЕТОВ (4 на вопрос, 1 верный) ───────────────
insert into options (id, question_id, text, is_correct) values
-- Математика
('q-pmath-1-a','q-pmath-1','13',false),('q-pmath-1-b','q-pmath-1','15',true),('q-pmath-1-c','q-pmath-1','17',false),('q-pmath-1-d','q-pmath-1','21',false),
('q-pmath-2-a','q-pmath-2','3',false),('q-pmath-2-b','q-pmath-2','5',true),('q-pmath-2-c','q-pmath-2','7',false),('q-pmath-2-d','q-pmath-2','9',false),
('q-pmath-3-a','q-pmath-3','100',false),('q-pmath-3-b','q-pmath-3','150',false),('q-pmath-3-c','q-pmath-3','250',true),('q-pmath-3-d','q-pmath-3','300',false),
('q-pmath-4-a','q-pmath-4','3/2',true),('q-pmath-4-b','q-pmath-4','2/3',false),('q-pmath-4-c','q-pmath-4','8/27',false),('q-pmath-4-d','q-pmath-4','9/4',false),
('q-pmath-5-a','q-pmath-5','45',false),('q-pmath-5-b','q-pmath-5','50',false),('q-pmath-5-c','q-pmath-5','55',true),('q-pmath-5-d','q-pmath-5','100',false),
('q-pmath-6-a','q-pmath-6','7',false),('q-pmath-6-b','q-pmath-6','30',false),('q-pmath-6-c','q-pmath-6','42',true),('q-pmath-6-d','q-pmath-6','49',false),
('q-pmath-7-a','q-pmath-7','60%',false),('q-pmath-7-b','q-pmath-7','72%',false),('q-pmath-7-c','q-pmath-7','75%',true),('q-pmath-7-d','q-pmath-7','80%',false),
('q-pmath-8-a','q-pmath-8','15',false),('q-pmath-8-b','q-pmath-8','16',false),('q-pmath-8-c','q-pmath-8','16.5',true),('q-pmath-8-d','q-pmath-8','17',false),
('q-pmath-9-a','q-pmath-9','6',false),('q-pmath-9-b','q-pmath-9','8',true),('q-pmath-9-c','q-pmath-9','9',false),('q-pmath-9-d','q-pmath-9','18',false),
('q-pmath-10-a','q-pmath-10','512',false),('q-pmath-10-b','q-pmath-10','1000',false),('q-pmath-10-c','q-pmath-10','1024',true),('q-pmath-10-d','q-pmath-10','2048',false),

-- Геометрия
('q-pgeom-1-a','q-pgeom-1','31.4',false),('q-pgeom-1-b','q-pgeom-1','62.8',false),('q-pgeom-1-c','q-pgeom-1','314',true),('q-pgeom-1-d','q-pgeom-1','100',false),
('q-pgeom-2-a','q-pgeom-2','10',true),('q-pgeom-2-b','q-pgeom-2','12',false),('q-pgeom-2-c','q-pgeom-2','14',false),('q-pgeom-2-d','q-pgeom-2','48',false),
('q-pgeom-3-a','q-pgeom-3','180°',false),('q-pgeom-3-b','q-pgeom-3','270°',false),('q-pgeom-3-c','q-pgeom-3','360°',true),('q-pgeom-3-d','q-pgeom-3','540°',false),
('q-pgeom-4-a','q-pgeom-4','12',false),('q-pgeom-4-b','q-pgeom-4','16',false),('q-pgeom-4-c','q-pgeom-4','48',false),('q-pgeom-4-d','q-pgeom-4','64',true),
('q-pgeom-5-a','q-pgeom-5','16',false),('q-pgeom-5-b','q-pgeom-5','30',true),('q-pgeom-5-c','q-pgeom-5','60',false),('q-pgeom-5-d','q-pgeom-5','80',false),
('q-pgeom-6-a','q-pgeom-6','21.98',false),('q-pgeom-6-b','q-pgeom-6','43.96',true),('q-pgeom-6-c','q-pgeom-6','87.92',false),('q-pgeom-6-d','q-pgeom-6','153.86',false),
('q-pgeom-7-a','q-pgeom-7','13',false),('q-pgeom-7-b','q-pgeom-7','26',false),('q-pgeom-7-c','q-pgeom-7','40',true),('q-pgeom-7-d','q-pgeom-7','45',false),
('q-pgeom-8-a','q-pgeom-8','94.2',false),('q-pgeom-8-b','q-pgeom-8','188.4',false),('q-pgeom-8-c','q-pgeom-8','282.6',true),('q-pgeom-8-d','q-pgeom-8','314',false),
('q-pgeom-9-a','q-pgeom-9','45°',false),('q-pgeom-9-b','q-pgeom-9','60°',true),('q-pgeom-9-c','q-pgeom-9','120°',false),('q-pgeom-9-d','q-pgeom-9','135°',false),
('q-pgeom-10-a','q-pgeom-10','5',false),('q-pgeom-10-b','q-pgeom-10','7.05',true),('q-pgeom-10-c','q-pgeom-10','10',false),('q-pgeom-10-d','q-pgeom-10','25',false),

-- Аналогии
('q-panalog-1-a','q-panalog-1','Дом',false),('q-panalog-1-b','q-panalog-1','Стена',true),('q-panalog-1-c','q-panalog-1','Цемент',false),('q-panalog-1-d','q-panalog-1','Камень',false),
('q-panalog-2-a','q-panalog-2','Время',true),('q-panalog-2-b','q-panalog-2','Стрелка',false),('q-panalog-2-c','q-panalog-2','Цифра',false),('q-panalog-2-d','q-panalog-2','Будильник',false),
('q-panalog-3-a','q-panalog-3','Картина',false),('q-panalog-3-b','q-panalog-3','Симфония',true),('q-panalog-3-c','q-panalog-3','Скрипка',false),('q-panalog-3-d','q-panalog-3','Ноты',false),
('q-panalog-4-a','q-panalog-4','Вода',false),('q-panalog-4-b','q-panalog-4','Еда',true),('q-panalog-4-c','q-panalog-4','Жажда',false),('q-panalog-4-d','q-panalog-4','Поле',false),
('q-panalog-5-a','q-panalog-5','Аэропорт',false),('q-panalog-5-b','q-panalog-5','Самолёт',true),('q-panalog-5-c','q-panalog-5','Небо',false),('q-panalog-5-d','q-panalog-5','Штурвал',false),
('q-panalog-6-a','q-panalog-6','Здание',false),('q-panalog-6-b','q-panalog-6','Экспонаты',true),('q-panalog-6-c','q-panalog-6','Гид',false),('q-panalog-6-d','q-panalog-6','Билет',false),
('q-panalog-7-a','q-panalog-7','Гнездо',false),('q-panalog-7-b','q-panalog-7','Птенец',true),('q-panalog-7-c','q-panalog-7','Скорлупа',false),('q-panalog-7-d','q-panalog-7','Желток',false),
('q-panalog-8-a','q-panalog-8','Дверь',false),('q-panalog-8-b','q-panalog-8','Сейф',true),('q-panalog-8-c','q-panalog-8','Пароль',false),('q-panalog-8-d','q-panalog-8','Цифра',false),
('q-panalog-9-a','q-panalog-9','Книга',false),('q-panalog-9-b','q-panalog-9','Ручка',true),('q-panalog-9-c','q-panalog-9','Бумага',false),('q-panalog-9-d','q-panalog-9','Слово',false),
('q-panalog-10-a','q-panalog-10','Снег',false),('q-panalog-10-b','q-panalog-10','Дрожь',true),('q-panalog-10-c','q-panalog-10','Лёд',false),('q-panalog-10-d','q-panalog-10','Зима',false),

-- Чтение и понимание
('q-pread-1-a','q-pread-1','многословный',false),('q-pread-1-b','q-pread-1','краткий',true),('q-pread-1-c','q-pread-1','сложный',false),('q-pread-1-d','q-pread-1','громкий',false),
('q-pread-2-a','q-pread-2','добрый',false),('q-pread-2-b','q-pread-2','скупой',true),('q-pread-2-c','q-pread-2','богатый',false),('q-pread-2-d','q-pread-2','весёлый',false),
('q-pread-3-a','q-pread-3','скрывать',false),('q-pread-3-b','q-pread-3','обращаться, призывать',true),('q-pread-3-c','q-pread-3','отрицать',false),('q-pread-3-d','q-pread-3','повторять',false),
('q-pread-4-a','q-pread-4','вечный',false),('q-pread-4-b','q-pread-4','недолговечный',true),('q-pread-4-c','q-pread-4','прочный',false),('q-pread-4-d','q-pread-4','тяжёлый',false),
('q-pread-5-a','q-pread-5','древний',false),('q-pread-5-b','q-pread-5','современный',true),('q-pread-5-c','q-pread-5','старинный',false),('q-pread-5-d','q-pread-5','забытый',false),
('q-pread-6-a','q-pread-6','небрежный',false),('q-pread-6-b','q-pread-6','тщательный',true),('q-pread-6-c','q-pread-6','быстрый',false),('q-pread-6-d','q-pread-6','ленивый',false),
('q-pread-7-a','q-pread-7','скромный',false),('q-pread-7-b','q-pread-7','честолюбивый',true),('q-pread-7-c','q-pread-7','ленивый',false),('q-pread-7-d','q-pread-7','спокойный',false),
('q-pread-8-a','q-pread-8','усиливать',false),('q-pread-8-b','q-pread-8','сглаживать различия',true),('q-pread-8-c','q-pread-8','создавать',false),('q-pread-8-d','q-pread-8','разрушать',false),
('q-pread-9-a','q-pread-9','реалист',false),('q-pread-9-b','q-pread-9','пессимист',true),('q-pread-9-c','q-pread-9','мечтатель',false),('q-pread-9-d','q-pread-9','эгоист',false),
('q-pread-10-a','q-pread-10','радостный',false),('q-pread-10-b','q-pread-10','грустный',true),('q-pread-10-c','q-pread-10','злой',false),('q-pread-10-d','q-pread-10','спокойный',false),

-- Грамматика
('q-pgram-1-a','q-pgram-1','am',false),('q-pgram-1-b','q-pgram-1','was',false),('q-pgram-1-c','q-pgram-1','were',true),('q-pgram-1-d','q-pgram-1','be',false),
('q-pgram-2-a','q-pgram-2','yet',false),('q-pgram-2-b','q-pgram-2','already',true),('q-pgram-2-c','q-pgram-2','since',false),('q-pgram-2-d','q-pgram-2','ago',false),
('q-pgram-3-a','q-pgram-3','reads',false),('q-pgram-3-b','q-pgram-3','has been read',true),('q-pgram-3-c','q-pgram-3','is reading',false),('q-pgram-3-d','q-pgram-3','have read',false),
('q-pgram-4-a','q-pgram-4','work',false),('q-pgram-4-b','q-pgram-4','will work',false),('q-pgram-4-c','q-pgram-4','will have worked',true),('q-pgram-4-d','q-pgram-4','worked',false),
('q-pgram-5-a','q-pgram-5','am',false),('q-pgram-5-b','q-pgram-5','were',true),('q-pgram-5-c','q-pgram-5','will be',false),('q-pgram-5-d','q-pgram-5','being',false),
('q-pgram-6-a','q-pgram-6','take',false),('q-pgram-6-b','q-pgram-6','to take',false),('q-pgram-6-c','q-pgram-6','taking',true),('q-pgram-6-d','q-pgram-6','took',false),
('q-pgram-7-a','q-pgram-7','are',false),('q-pgram-7-b','q-pgram-7','is',true),('q-pgram-7-c','q-pgram-7','were',false),('q-pgram-7-d','q-pgram-7','be',false),
('q-pgram-8-a','q-pgram-8','good',false),('q-pgram-8-b','q-pgram-8','better',true),('q-pgram-8-c','q-pgram-8','best',false),('q-pgram-8-d','q-pgram-8','well',false),
('q-pgram-9-a','q-pgram-9','If',false),('q-pgram-9-b','q-pgram-9','Had',true),('q-pgram-9-c','q-pgram-9','Have',false),('q-pgram-9-d','q-pgram-9','Would',false),
('q-pgram-10-a','q-pgram-10','go',false),('q-pgram-10-b','q-pgram-10','went',true),('q-pgram-10-c','q-pgram-10','gone',false),('q-pgram-10-d','q-pgram-10','going',false)
on conflict (id) do nothing;
