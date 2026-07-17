# Archived ad hoc SQL files

These 14 files were the original schema/seed scripts, run by hand against the
live Supabase project via the SQL Editor (not through a migration tool). They
are kept here for reference/history only — do not run them again.

They've been reconciled into `supabase/migrations/` as a baseline (see that
directory's file headers for how conflicts between these files were resolved,
e.g. `supabase_update_v2.sql` dropping `user_topic_progress`, or the two
divergent copies of the `handle_new_user()` trigger). That reconciliation was
done by reading these files, not by pulling the live schema — so before
trusting `supabase/migrations/` as authoritative, run `supabase db diff`
against the live project to confirm it actually matches.
