-- «Код школы» удалён из приложения — класс-код (public_find_class_by_code,
-- 20260729000001) уже линкует и школу через classes.school_id, так что
-- отдельный ввод кода школы больше не нужен.
drop function if exists public_find_school_by_code(text);
