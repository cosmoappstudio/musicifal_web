-- Musicifal initial schema
-- Users, Spotify tokens, raw Spotify data

-- Users (linked to Spotify)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spotify OAuth tokens
CREATE TABLE IF NOT EXISTS public.spotify_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Raw Spotify API responses (for analysis pipeline)
CREATE TABLE IF NOT EXISTS public.spotify_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile JSONB,
  recently_played JSONB,
  top_artists_short JSONB,
  top_artists_medium JSONB,
  top_artists_long JSONB,
  top_tracks_short JSONB,
  top_tracks_medium JSONB,
  top_tracks_long JSONB,
  audio_features JSONB,
  devices JSONB,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick user lookup by Spotify ID
CREATE INDEX IF NOT EXISTS idx_users_spotify_user_id ON public.users(spotify_user_id);

-- Index for raw data per user
CREATE INDEX IF NOT EXISTS idx_spotify_raw_data_user_id ON public.spotify_raw_data(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_raw_data_fetched_at ON public.spotify_raw_data(fetched_at DESC);

-- RLS policies (enable RLS, allow service role full access)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_raw_data ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; anon/authenticated need explicit policies.
-- For server-side API routes using service role, no extra policies needed.
-- Optional: add policies for authenticated users to read own data
-- CREATE POLICY "Users can read own" ON public.users FOR SELECT USING (auth.uid() = id);
