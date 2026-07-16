// Storage-agnostic Supabase access shared by apps/mobile and
// apps/school-web: each app calls Supabase only through this package,
// never `@supabase/supabase-js` directly, so swapping the backend later
// (or hardening it, e.g. server-side XP validation via a Postgres RPC)
// doesn't require touching either app's call sites. Populated in a
// follow-up step by generalizing apps/mobile/src/lib/supabase.ts and
// apps/mobile/src/services/*.
export {};
