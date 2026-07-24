-- Adds a short join code to schools, so students can optionally link
-- themselves to a partner school at registration by typing a code
-- instead of picking from a (likely empty/incomplete) list.
--
-- NOT YET APPLIED to the live project — same caveat as prior migrations.

alter table schools
  add column if not exists code text unique;
