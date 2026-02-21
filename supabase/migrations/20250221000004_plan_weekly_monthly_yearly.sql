-- Migrate plan from starter/pro to weekly/monthly/yearly
-- Run if you have existing data with starter/pro

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'weekly', 'monthly', 'yearly'));

-- Optional: migrate existing starter -> monthly, pro -> yearly
-- UPDATE public.users SET plan = 'monthly' WHERE plan = 'starter';
-- UPDATE public.users SET plan = 'yearly' WHERE plan = 'pro';
