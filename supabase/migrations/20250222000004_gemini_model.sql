-- Varsayılan Replicate modeli: Gemini 2.5 Flash
UPDATE public.app_settings
SET replicate_model_id = 'google/gemini-2.5-flash',
    updated_at = now()
WHERE id = 'default';
