-- Add poster_url column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS poster_url TEXT;