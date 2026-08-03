-- Rank rule change: a student can now reach rank C on XP alone (no premium).
-- Premium is only required for the top three ranks B, A and S. Previously any
-- non-premium student was pinned at D regardless of XP. Mirrors the mobile
-- PREMIUM_RANKS = ['B','A','S'] already used on the onboarding/premium screens.
create or replace function compute_rank(p_xp int, p_avg_mock numeric, p_premium bool)
returns text language sql immutable as $$
  select case
    when coalesce(p_premium, false) and p_xp >= 8000 and coalesce(p_avg_mock, 0) > 200 then 'S'
    when coalesce(p_premium, false) and p_xp >= 5000 then 'A'
    when coalesce(p_premium, false) and p_xp >= 2500 then 'B'
    when p_xp >= 1000 then 'C'
    else 'D'
  end;
$$;

-- Recompute every existing student's rank under the new rule.
update students s
set rank = compute_rank(
  s.xp,
  (select avg(total) from mock_results m where m.student_id = s.id),
  s.premium_unlocked
);
