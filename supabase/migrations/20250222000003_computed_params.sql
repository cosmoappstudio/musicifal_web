-- Kullanıcı bazında hesaplanan parametreler: son 50 şarkı, top 10 tekrar, türler, günün ritmi
ALTER TABLE public.spotify_raw_data
  ADD COLUMN IF NOT EXISTS computed_params JSONB;
