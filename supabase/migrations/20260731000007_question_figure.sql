-- Чертёж к вопросу — не картинка, а короткое JSON-описание (точки, отрезки, окружности, углы),
-- которое рисует компонент Figure в school-web. Идемпотентно.
alter table school_test_questions add column if not exists figure jsonb;
