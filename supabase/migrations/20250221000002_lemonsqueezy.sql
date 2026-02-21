-- Lemon Squeezy subscription tracking (optional - for customer portal links, etc.)
-- Plan updates are handled via webhooks; these columns allow linking to LS customer/subscription

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_ls_customer ON public.users(lemonsqueezy_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_subscription ON public.users(lemonsqueezy_subscription_id);
