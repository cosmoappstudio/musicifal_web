-- Enable UUID extension (if using Postgres/Supabase)
-- create extension if not exists "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- UUID from auth provider
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL, -- 'spotify' or 'google'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  current_period_end DATETIME,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ANALYSES TABLE (Stores raw data fetched from APIs)
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL, -- 'spotify' or 'youtube'
  data_snapshot JSON NOT NULL, -- Full JSON of the 6 data points
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FORTUNES TABLE (Stores generated fortunes)
CREATE TABLE IF NOT EXISTS fortunes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  analysis_id TEXT NOT NULL REFERENCES analyses(id),
  fortune_text_tr TEXT,
  fortune_text_en TEXT,
  fortune_text_de TEXT,
  fortune_text_fr TEXT,
  theme TEXT DEFAULT 'mystic',
  is_shared BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SHARE LINKS TABLE
CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  fortune_id TEXT NOT NULL REFERENCES fortunes(id),
  slug TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
