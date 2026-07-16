import { supabase } from '../lib/supabase';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

/** Сменить пароль текущего (залогиненного) пользователя. */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

/** Отправить письмо для сброса пароля (с 6-значным кодом в шаблоне). */
export async function resetPassword(email: string, redirectTo?: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
}

/** Проверить код сброса из письма. При успехе создаётся recovery-сессия. */
export async function verifyRecoveryCode(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'recovery',
  });
}

/**
 * Удалить аккаунт. Удаление auth-пользователя невозможно с клиента напрямую,
 * поэтому вызывается RPC `delete_account` (SECURITY DEFINER) в Supabase.
 * После успеха разлогиниваем.
 */
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_account');
  if (!error) await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
