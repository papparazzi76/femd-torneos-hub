-- Add new columns to participants table for team statistics
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;