-- ══════════════════════════════════════════════════════════════
-- Удаление аккаунта пользователем из приложения.
-- Запусти ОДИН РАЗ в Supabase Dashboard → SQL Editor.
-- ══════════════════════════════════════════════════════════════
-- Функция удаляет текущего auth-пользователя (auth.uid()).
-- За счёт ON DELETE CASCADE на user_profiles / user_topic_progress
-- профиль и прогресс удалятся автоматически.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- Доступ только авторизованным пользователям (каждый удаляет только себя).
revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
