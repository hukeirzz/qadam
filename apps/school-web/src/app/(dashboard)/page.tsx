import { createServerApi } from '@/lib/supabase/server';
import { DashboardHome } from '@/components/dashboard-home';

export default async function DashboardHomePage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  const name =
    (session?.user.user_metadata?.name as string | undefined) ||
    session?.user.email?.split('@')[0] ||
    'Пользователь';
  const firstName = name.split(/\s+/)[0];

  return <DashboardHome firstName={firstName} />;
}
