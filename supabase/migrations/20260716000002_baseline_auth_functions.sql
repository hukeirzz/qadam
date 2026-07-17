-- Baseline auth trigger + account-deletion function, reconciled from
-- supabase_full_setup.sql / supabase_fix_profiles.sql (two divergent copies
-- of handle_new_user existed — this keeps the later, safer one with
-- `set search_path = public`) and supabase_delete_account.sql.
--
-- NOT YET VERIFIED against the live project — see 20260716000001 header.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, name, streak, gems, xp, premium_unlocked)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    0, 0, 0, false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Deletes the currently-authenticated user (auth.uid()). user_profiles rows
-- cascade via its own ON DELETE CASCADE FK to auth.users; the original
-- comment here also referenced user_topic_progress, which no longer exists
-- (see 20260716000001's note) — that part of the cascade is stale/removed.
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

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
