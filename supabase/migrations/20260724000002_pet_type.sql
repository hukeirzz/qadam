-- Records which pet species the user picked on PetNameScreen (bars/cat/
-- dog/eagle/penguin illustrations) instead of just its name — needed so
-- the chosen art can be shown again on Home/Profile after onboarding.
--
-- NOT YET APPLIED to the live project — same caveat as prior migrations.

alter table user_profiles
  add column if not exists pet_type text
    check (pet_type in ('bars', 'cat', 'dog', 'eagle', 'penguin'));
