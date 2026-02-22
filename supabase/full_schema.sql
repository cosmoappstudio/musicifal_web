-- =============================================================================
-- Musicifal – Tüm Supabase şeması (tek seferde çalıştırma)
-- Supabase Dashboard → SQL Editor → bu dosyayı yapıştırıp çalıştırın
-- =============================================================================

-- ─── 1. Users (Spotify ile bağlı) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Lemon Squeezy + Admin (users tablosuna) ───────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ─── 3. Spotify OAuth tokens ─────────────────────────────────────────────────
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

-- ─── 4. Raw Spotify API responses ────────────────────────────────────────────
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
  genre_analysis JSONB,
  computed_params JSONB,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Fortunes (fal geçmişi, limit takibi) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'de', 'ru')),
  featured BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. App settings (Admin AI, bildirim, paylaşım) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  -- AI / Replicate
  replicate_model_id TEXT NOT NULL DEFAULT 'meta/meta-llama-3-8b-instruct',
  fortune_prompt_template TEXT NOT NULL DEFAULT 'Sen mistik bir müzik falcısısın. Kullanıcının son 14 günlük dinleme verilerine bakarak Türk kahve falı geleneğinden ilham alan, kişisel ve gizemli bir fal yorumu yaz. 4 paragraf, her biri 3-4 cümle. Akıcı ve şiirsel ol.',
  fortune_max_tokens INTEGER NOT NULL DEFAULT 1024,
  fortune_temperature NUMERIC(3,2) NOT NULL DEFAULT 0.85,
  fortune_test_mode BOOLEAN NOT NULL DEFAULT false,
  -- General
  site_active BOOLEAN NOT NULL DEFAULT true,
  accept_new_registrations BOOLEAN NOT NULL DEFAULT true,
  max_free_fortunes INTEGER NOT NULL DEFAULT 1,
  analysis_period_days INTEGER NOT NULL DEFAULT 14,
  -- Notifications / Banner
  banner_text TEXT NOT NULL DEFAULT '🎵 Yeni özellik: Arkadaşınla müzik DNA''sını karşılaştır!',
  banner_active BOOLEAN NOT NULL DEFAULT true,
  banner_type TEXT NOT NULL DEFAULT 'info' CHECK (banner_type IN ('info', 'warning', 'success')),
  -- Sharing
  story_watermark_text TEXT NOT NULL DEFAULT 'musicifal.app ile oluşturuldu',
  whatsapp_template TEXT NOT NULL DEFAULT 'Müzik falıma bak! 🎵✨ {link}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mevcut app_settings varsa yeni kolonları ekle (idempotent)
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS banner_text TEXT DEFAULT '🎵 Yeni özellik: Arkadaşınla müzik DNA''sını karşılaştır!',
  ADD COLUMN IF NOT EXISTS banner_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS banner_type TEXT DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS story_watermark_text TEXT DEFAULT 'musicifal.app ile oluşturuldu',
  ADD COLUMN IF NOT EXISTS whatsapp_template TEXT DEFAULT 'Müzik falıma bak! 🎵✨ {link}';

-- ─── 7. Indexler ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_spotify_user_id ON public.users(spotify_user_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_customer ON public.users(lemonsqueezy_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_subscription ON public.users(lemonsqueezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_spotify_raw_data_user_id ON public.spotify_raw_data(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_raw_data_fetched_at ON public.spotify_raw_data(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_fortunes_user_id ON public.fortunes(user_id);
CREATE INDEX IF NOT EXISTS idx_fortunes_generated_at ON public.fortunes(generated_at DESC);

-- ─── 8. RLS (Row Level Security) ─────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ─── 9. Varsayılan app_settings satırı ───────────────────────────────────────
INSERT INTO public.app_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;
