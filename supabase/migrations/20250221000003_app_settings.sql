-- App settings (AI model, prompts, etc.) for admin configuration
-- Single-row table: id = 'default'

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
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;
