-- Фото к вопросам школьных тестов (например, чертёж по геометрии).
--  * school_test_questions.image_url — публичная ссылка на файл в бакете question-images.
--  * бакет question-images: читать может кто угодно по ссылке (имена файлов — случайные uuid),
--    загружать и удалять — только учителя, и только в папку своей школы ({school_id}/...).
-- Идемпотентно.

alter table school_test_questions add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('question-images', 'question-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "question_images_staff_insert" on storage.objects;
create policy "question_images_staff_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'question-images'
    and is_staff()
    and (storage.foldername(name))[1] = current_school_id()::text
  );

drop policy if exists "question_images_staff_delete" on storage.objects;
create policy "question_images_staff_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'question-images'
    and is_staff()
    and (storage.foldername(name))[1] = current_school_id()::text
  );
