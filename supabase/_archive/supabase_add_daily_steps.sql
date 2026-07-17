-- Add daily_steps column to track per-day activity (used for month chart)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_steps jsonb DEFAULT '{}';
