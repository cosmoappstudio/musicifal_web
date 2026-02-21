# Musicifal Backend

## Spotify Web API – Kullanılan Veriler

| Endpoint | Scope | Veri |
|----------|-------|------|
| `GET /me` | user-read-private, user-read-email | Profil (ad, email, avatar) |
| `GET /me/player/recently-played` | user-read-recently-played | Son dinlenen parçalar + `played_at`, `context` |
| `GET /me/top/artists` | user-top-read | Top sanatçılar (short/medium/long term) |
| `GET /me/top/tracks` | user-top-read | Top parçalar (short/medium/long term) |
| `GET /audio-features` | (token) | danceability, energy, valence, loudness, tempo… |
| `GET /me/player/devices` | user-read-playback-state | Bağlı cihazlar |
| `GET /me/tracks` | user-library-read | Kayıtlı parçalar (opsiyonel) |

## Kurulum

### 1. Ortam Değişkenleri

`.env.local` dosyasını `.env.example` ile oluşturup değerleri doldurun.

### 2. Spotify Dashboard

1. [Spotify for Developers](https://developer.spotify.com/dashboard) üzerinden uygulama oluşturun.
2. Redirect URI ekleyin:
   - Local: `http://localhost:3000/api/auth/callback`
   - Prod: `https://musicifal.app/api/auth/callback`
3. Client ID ve Client Secret’i `.env.local` dosyasına yazın.

### 3. Supabase

1. [Supabase](https://supabase.com) projesi oluşturun.
2. SQL Editor’da `supabase/migrations/20250221000001_initial_schema.sql` içeriğini çalıştırın.
3. API ayarlarından URL, anon key ve service role key’i `.env.local` dosyasına ekleyin.

### 4. Vercel Deployment

1. Projeyi Vercel’e bağlayın.
2. Environment variables’ı ekleyin.
3. `SPOTIFY_REDIRECT_URI` = `https://musicifal.app/api/auth/callback`
4. `NEXT_PUBLIC_APP_URL` = `https://musicifal.app`

### 5. Replicate (AI yorumlama)

1. [Replicate](https://replicate.com/account/api-tokens) hesabı oluşturun, API token alın.
2. `.env.local` dosyasına `REPLICATE_API_TOKEN=...` ekleyin.
3. Admin panel → Ayarlar → AI Ayarlarından fal için kullanılacak modeli seçin (örn. meta/meta-llama-3-8b-instruct).
4. Supabase’te `app_settings` tablosu migration ile oluşturulmalı (`20250221000003_app_settings.sql`).

### 6. Lemon Squeezy (Ödemeler)

1. [Lemon Squeezy](https://app.lemonsqueezy.com) hesabı oluşturun, Store ve ürünler ekleyin.
2. Starter ve Pro için subscription ürünleri oluşturun, variant ID’lerini alın.
3. [API Keys](https://app.lemonsqueezy.com/settings/api) → API Key oluşturun.
4. [Webhooks](https://app.lemonsqueezy.com/settings/webhooks) → Yeni webhook:
   - URL: `https://musicifal.app/api/webhooks/lemonsqueezy`
   - Events: `order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_payment_success`, `subscription_payment_failed`
   - Signing secret oluşturup `LEMONSQUEEZY_WEBHOOK_SECRET` olarak ekleyin.
5. Env: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_STARTER`, `LEMONSQUEEZY_VARIANT_PRO`, `LEMONSQUEEZY_WEBHOOK_SECRET`

## API Routes

- `GET /api/auth/spotify` – Spotify OAuth’a yönlendirir
- `GET /api/auth/callback` – OAuth callback (Spotify tarafından çağrılır)
- `POST /api/auth/logout` – Oturumu sonlandırır
- `POST /api/spotify/fetch` – Kullanıcının tüm Spotify verisini çekip Supabase’e kaydeder
- `POST /api/lemonsqueezy/checkout` – Plan için checkout URL oluşturur (body: `{ plan: 'starter' | 'pro' }`)
- `POST /api/webhooks/lemonsqueezy` – Lemon Squeezy webhook (plan güncelleme)

## Akış

1. Kullanıcı “Spotify ile Başla” butonuna tıklar → `/api/auth/spotify`
2. Spotify izin ekranı → kullanıcı onaylar
3. Callback → kullanıcı oluşturulur, token’lar saklanır, session cookie set edilir
4. Dashboard’da “Verilerimi Getir” → `POST /api/spotify/fetch` → `spotify_raw_data` tablosuna yazılır
