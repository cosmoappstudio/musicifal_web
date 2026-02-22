-- Add genre_analysis column to spotify_raw_data (Replicate AI genre inference)
ALTER TABLE public.spotify_raw_data
  ADD COLUMN IF NOT EXISTS genre_analysis JSONB;
