-- Run in Supabase Dashboard → SQL Editor
-- Fixes data reset bug by adding the topic_hearts column

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS topic_hearts jsonb DEFAULT '{}';
