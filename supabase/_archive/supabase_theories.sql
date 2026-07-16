-- Table for topic theory content shown before each quiz
CREATE TABLE IF NOT EXISTS topic_theories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id   text        NOT NULL UNIQUE,
  subject_id text        NOT NULL,
  title      text        NOT NULL,
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: authenticated users can read, only service role can write
ALTER TABLE topic_theories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read theories"
  ON topic_theories FOR SELECT
  TO authenticated
  USING (true);

-- Example: inserting a theory (replace values as needed)
-- INSERT INTO topic_theories (topic_id, subject_id, title, content)
-- VALUES (
--   'math_topic_1',
--   'math',
--   'Линейные уравнения',
--   'Линейное уравнение — это уравнение вида ax + b = 0, где a ≠ 0.
--
-- Чтобы решить линейное уравнение, нужно перенести все слагаемые с переменной в одну сторону, а числа — в другую.
--
-- Пример: 2x + 4 = 10
-- 2x = 10 - 4
-- 2x = 6
-- x = 3'
-- );
