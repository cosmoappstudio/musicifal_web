import type {
  MockUser,
  MockAnalysis,
  MockFortune,
  MockAdminStats,
  AdminUser,
  AdminAnalysis,
  AdminFortune,
  AdminRevenue,
  Transaction,
  AppSettings,
  MockAnalytics,
} from '@/types';

// ─── User ──────────────────────────────────────────────────────────────────────

export const mockUser: MockUser = {
  id: 'usr_01JK8X4Z7Y6W5V4U3T2S1R0Q',
  name: 'Ayşe Kaya',
  email: 'ayse.kaya@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse&backgroundColor=7C3AED',
  spotifyConnected: true,
  plan: 'yearly',
  joinedAt: '2024-11-15T10:30:00Z',
  lastAnalyzedAt: '2025-02-19T14:22:00Z',
};

// ─── Analysis ──────────────────────────────────────────────────────────────────

export const mockAnalysis: MockAnalysis = {
  period: 'last_14_days',
  genres: [
    { name: 'Indie Pop', percentage: 32, mood: 'İçedönük', moodKey: 'introspective', color: '#7C3AED' },
    { name: 'Lo-fi', percentage: 24, mood: 'Sakin', moodKey: 'calm', color: '#A855F7' },
    { name: 'Phonk', percentage: 18, mood: 'Agresif', moodKey: 'aggressive', color: '#C084FC' },
    { name: 'R&B', percentage: 14, mood: 'Duygusal', moodKey: 'emotional', color: '#E879F9' },
    { name: 'Classical', percentage: 8, mood: 'Dingin', moodKey: 'peaceful', color: '#D97706' },
    { name: 'Other', percentage: 4, mood: 'Karışık', moodKey: 'mixed', color: '#6B7280' },
  ],
  topArtists: [
    { rank: 1, name: 'Arctic Monkeys', playCount: 148, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f', genre: 'Indie Rock' },
    { rank: 2, name: 'Tame Impala', playCount: 127, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb012e9b1c67f5a8e6deb1ee41', genre: 'Psych Rock' },
    { rank: 3, name: 'The Weeknd', playCount: 112, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', genre: 'R&B' },
    { rank: 4, name: 'Lana Del Rey', playCount: 98, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4c8ebfcf215c69d7e8812d27', genre: 'Indie Pop' },
    { rank: 5, name: 'Glass Animals', playCount: 87, imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebf0c20db5ef6c6fbe5135cbc2', genre: 'Indie Pop' },
    { rank: 6, name: 'Frank Ocean', playCount: 76, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb504cc9d0f07d5a7c28cde26a', genre: 'R&B' },
    { rank: 7, name: 'Tyler, The Creator', playCount: 64, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4297634e15e29ef8a85fb7f5', genre: 'Hip-Hop' },
    { rank: 8, name: 'Billie Eilish', playCount: 58, imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf', genre: 'Alt Pop' },
    { rank: 9, name: 'Radiohead', playCount: 47, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb66c2c29b12a5ac8eca4b3888', genre: 'Alt Rock' },
    { rank: 10, name: 'Daft Punk', playCount: 39, imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0f4e38ae9b63a8eb5f8ea7f3', genre: 'Electronic' },
  ],
  timeOfDay: {
    morning: { genre: 'Lo-fi', mood: 'Odaklanmış', moodKey: 'focused', trackCount: 87 },
    afternoon: { genre: 'Indie Pop', mood: 'Düşünceli', moodKey: 'thoughtful', trackCount: 134 },
    evening: { genre: 'R&B', mood: 'Romantik', moodKey: 'romantic', trackCount: 112 },
    night: { genre: 'Phonk', mood: 'Yoğun', moodKey: 'intense', trackCount: 93 },
  },
  topRepeated: [
    {
      rank: 1,
      name: 'Do I Wanna Know?',
      artist: 'Arctic Monkeys',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273dc31d8ba01fc7a2a7bae9f78',
      repeatCount: 42,
      valence: 0.38,
      energy: 0.71,
      danceability: 0.59,
    },
    {
      rank: 2,
      name: 'The Less I Know The Better',
      artist: 'Tame Impala',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d2e',
      repeatCount: 31,
      valence: 0.62,
      energy: 0.78,
      danceability: 0.64,
    },
    {
      rank: 3,
      name: 'Heat Waves',
      artist: 'Glass Animals',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea',
      repeatCount: 24,
      valence: 0.45,
      energy: 0.53,
      danceability: 0.72,
    },
  ],
  top50Songs: [
    { rank: 1, name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', albumArt: 'https://i.scdn.co/image/ab67616d0000b273dc31d8ba01fc7a2a7bae9f78', playCount: 42 },
    { rank: 2, name: 'The Less I Know The Better', artist: 'Tame Impala', albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d2e', playCount: 31 },
    { rank: 3, name: 'Heat Waves', artist: 'Glass Animals', albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea', playCount: 24 },
  ],
  devices: [],
  audioProfile: {
    avgValence: 0.52,
    avgEnergy: 0.67,
    avgDanceability: 0.61,
    avgTempo: 118,
    avgAcousticness: 0.21,
    trackCount: 50,
  },
};

// ─── Fortune ──────────────────────────────────────────────────────────────────

export const mockFortune: MockFortune = {
  tr: `Gecenin Phonk'u seni ele veriyor. O yoğun enerji, aslında bir şeyi susturmaya değil, hissetmeye çalıştığını gösteriyor. "Do I Wanna Know?" sorusunu 42 kez kendine sormuşsun — cevabı biliyorsun, ama henüz söylemeye hazır değilsin.

Lo-fi sabahların ise başka bir hikaye anlatıyor: Gün başlamadan önce kendinle barış yapmaya çalışıyorsun. O sessiz odak anları, dünün gürültüsünü yıkıyor. Bu, yüzleşmeden önce toprak toplayan birinin işareti.

Yakın gelecekte beklenmedik bir yüzleşme seni bekliyor. Kendi seçtiklerinden değil, sana seçilmiş olanlardan — ya bir müzik, ya bir söz, ya da o tanıdık ses. Hazırlıklı ol.

R&B akşamların son işareti: Romantizm arayışındasın ama bunun farkında değilsin. Müziğin duygularına izin verdiği o kısa sürelerde, gerçek duyguların yüzeye çıkıyor. Bu frekansta titreşmeye devam et.`,
  en: `Your nighttime Phonk betrays you. That intensity isn't about numbing — it's about feeling. You've asked yourself "Do I Wanna Know?" 42 times, and you already know the answer. You're just not ready to say it out loud yet.

Your Lo-fi mornings tell a different story: you're trying to make peace with yourself before the day begins. Those focused moments of silence dismantle yesterday's noise. This is the behavior of someone gathering strength before a reckoning.

In the near future, an unexpected confrontation awaits you — not one you've chosen, but one chosen for you. It may come through a song, a phrase, or a familiar voice. Be prepared.

Your R&B evenings carry the final signal: you're searching for romance without realizing it. In those brief moments when music allows your emotions to surface, your true feelings emerge. Keep vibrating at this frequency.`,
  de: `Dein nächtlicher Phonk verrät dich. Diese Intensität geht nicht ums Betäuben — sie geht ums Fühlen. Du hast dir "Do I Wanna Know?" 42 Mal gestellt und kennst die Antwort bereits. Du bist nur noch nicht bereit, sie laut auszusprechen.

Deine Lo-fi-Morgende erzählen eine andere Geschichte: Du versuchst, Frieden mit dir selbst zu schließen, bevor der Tag beginnt. Diese stillen Momente zerstreuen den Lärm von gestern. Das ist das Verhalten von jemandem, der Kraft sammelt, bevor eine Konfrontation kommt.

In naher Zukunft erwartet dich eine unerwartete Begegnung — nicht eine, die du gewählt hast, sondern eine, die für dich gewählt wurde. Sie könnte durch ein Lied, eine Phrase oder eine vertraute Stimme kommen. Sei vorbereitet.

Deine R&B-Abende tragen das letzte Signal: Du suchst nach Romantik, ohne es zu merken. Mach weiter, auf dieser Frequenz zu schwingen.`,
  ru: `Твоя ночная Phonk выдаёт тебя. Эта интенсивность — не про онемение, а про ощущение. Ты спросил себя «Do I Wanna Know?» 42 раза и уже знаешь ответ. Просто ещё не готов сказать это вслух.

Твои утренние Lo-fi рассказывают другую историю: ты пытаешься примириться с собой до начала дня. Эти моменты тишины разрушают шум вчерашнего дня. Это поведение человека, набирающего силы перед столкновением.

В ближайшем будущем тебя ждёт неожиданная встреча — не та, что ты выбрал, а та, что выбрана для тебя. Она может прийти через песню, фразу или знакомый голос. Будь готов.

Твои R&B-вечера несут последний сигнал: ты ищешь романтику, не осознавая этого. Продолжай вибрировать на этой частоте.`,
  generatedAt: '2025-02-19T14:22:00Z',
  isPro: true,
};

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export const mockAdminStats: MockAdminStats = {
  totalUsers: 4872,
  activeSubscriptions: 1341,
  monthlyRevenue: 12480,
  totalFortunes: 9234,
  conversionRate: 27.5,
  dailySignups: [
    { date: '2025-01-22', count: 23 },
    { date: '2025-01-23', count: 31 },
    { date: '2025-01-24', count: 18 },
    { date: '2025-01-25', count: 42 },
    { date: '2025-01-26', count: 38 },
    { date: '2025-01-27', count: 27 },
    { date: '2025-01-28', count: 19 },
    { date: '2025-01-29', count: 44 },
    { date: '2025-01-30', count: 51 },
    { date: '2025-01-31', count: 39 },
    { date: '2025-02-01', count: 62 },
    { date: '2025-02-02', count: 48 },
    { date: '2025-02-03', count: 33 },
    { date: '2025-02-04', count: 29 },
    { date: '2025-02-05', count: 57 },
    { date: '2025-02-06', count: 71 },
    { date: '2025-02-07', count: 64 },
    { date: '2025-02-08', count: 45 },
    { date: '2025-02-09', count: 38 },
    { date: '2025-02-10', count: 42 },
    { date: '2025-02-11', count: 55 },
    { date: '2025-02-12', count: 67 },
    { date: '2025-02-13', count: 73 },
    { date: '2025-02-14', count: 89 },
    { date: '2025-02-15', count: 76 },
    { date: '2025-02-16', count: 54 },
    { date: '2025-02-17', count: 48 },
    { date: '2025-02-18', count: 61 },
    { date: '2025-02-19', count: 70 },
    { date: '2025-02-20', count: 83 },
  ],
  topCountries: [
    { country: 'Türkiye', users: 2841, percentage: 58.3 },
    { country: 'Almanya', users: 612, percentage: 12.6 },
    { country: 'Rusya', users: 489, percentage: 10.0 },
    { country: 'Amerika', users: 341, percentage: 7.0 },
    { country: 'İngiltere', users: 289, percentage: 5.9 },
    { country: 'Diğer', users: 300, percentage: 6.2 },
  ],
  planDistribution: { free: 3531, weekly: 420, monthly: 891, yearly: 450 },
};

// ─── Admin Users ───────────────────────────────────────────────────────────────

export const mockAdminUsers: AdminUser[] = [
  { id: 'u1', name: 'Ayşe Kaya', email: 'ayse@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse', plan: 'yearly', joinedAt: '2024-11-15', lastLogin: '2025-02-21', source: 'spotify', fortuneCount: 24, status: 'active', gender: 'female' },
  { id: 'u2', name: 'Mehmet Demir', email: 'mehmet@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet', plan: 'monthly', joinedAt: '2024-12-03', lastLogin: '2025-02-20', source: 'spotify', fortuneCount: 8, status: 'active', gender: 'male' },
  { id: 'u3', name: 'Selin Yılmaz', email: 'selin@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selin', plan: 'free', joinedAt: '2025-01-10', lastLogin: '2025-02-19', source: 'spotify', fortuneCount: 1, status: 'active', gender: 'female' },
  { id: 'u4', name: 'Can Öztürk', email: 'can@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can', plan: 'yearly', joinedAt: '2024-10-22', lastLogin: '2025-02-21', source: 'spotify', fortuneCount: 31, status: 'active', gender: 'male' },
  { id: 'u5', name: 'Zeynep Arslan', email: 'zeynep@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep', plan: 'weekly', joinedAt: '2025-01-28', lastLogin: '2025-02-18', source: 'direct', fortuneCount: 3, status: 'active', gender: 'female' },
  { id: 'u6', name: 'Burak Çelik', email: 'burak@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak', plan: 'free', joinedAt: '2025-02-01', lastLogin: '2025-02-15', source: 'spotify', fortuneCount: 1, status: 'suspended', gender: 'male' },
  { id: 'u7', name: 'Fatma Şahin', email: 'fatma@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatma', plan: 'yearly', joinedAt: '2024-09-14', lastLogin: '2025-02-21', source: 'spotify', fortuneCount: 48, status: 'active', gender: 'female' },
  { id: 'u8', name: 'Emre Koç', email: 'emre@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emre', plan: 'free', joinedAt: '2025-02-10', lastLogin: '2025-02-17', source: 'spotify', fortuneCount: 1, status: 'active', gender: 'male' },
];

// ─── Admin Analyses ────────────────────────────────────────────────────────────

export const mockAdminAnalyses: AdminAnalysis[] = [
  { id: 'a1', userId: 'u1', userName: 'Ayşe Kaya', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse', analyzedAt: '2025-02-19T14:22:00Z', platform: 'spotify', plan: 'yearly', dominantGenre: 'Indie Pop', processingMs: 1240, gender: 'female' },
  { id: 'a2', userId: 'u4', userName: 'Can Öztürk', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can', analyzedAt: '2025-02-20T09:11:00Z', platform: 'spotify', plan: 'yearly', dominantGenre: 'Phonk', processingMs: 1180, gender: 'male' },
  { id: 'a3', userId: 'u2', userName: 'Mehmet Demir', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet', analyzedAt: '2025-02-20T16:45:00Z', platform: 'spotify', plan: 'monthly', dominantGenre: 'Pop', processingMs: 1520, gender: 'male' },
  { id: 'a4', userId: 'u7', userName: 'Fatma Şahin', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatma', analyzedAt: '2025-02-21T07:33:00Z', platform: 'spotify', plan: 'yearly', dominantGenre: 'R&B', processingMs: 1090, gender: 'female' },
  { id: 'a5', userId: 'u3', userName: 'Selin Yılmaz', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selin', analyzedAt: '2025-02-21T11:20:00Z', platform: 'spotify', plan: 'free', dominantGenre: 'Lo-fi', processingMs: 980, gender: 'female' },
];

// ─── Admin Fortunes ────────────────────────────────────────────────────────────

export const mockAdminFortunes: AdminFortune[] = [
  { id: 'f1', userId: 'u1', userName: 'Ayşe Kaya', generatedAt: '2025-02-19T14:23:00Z', plan: 'yearly', language: 'tr', preview: 'Gecenin Phonk\'u seni ele veriyor...', featured: true },
  { id: 'f2', userId: 'u4', userName: 'Can Öztürk', generatedAt: '2025-02-20T09:12:00Z', plan: 'yearly', language: 'en', preview: 'The rhythm of your nights speaks volumes...', featured: false },
  { id: 'f3', userId: 'u7', userName: 'Fatma Şahin', generatedAt: '2025-02-21T07:34:00Z', plan: 'yearly', language: 'tr', preview: 'R&B akşamların sır veriyor...', featured: true },
  { id: 'f4', userId: 'u2', userName: 'Mehmet Demir', generatedAt: '2025-02-20T16:46:00Z', plan: 'monthly', language: 'tr', preview: 'Hafta sonları Pop müziğe dönüşün...', featured: false },
  { id: 'f5', userId: 'u5', userName: 'Zeynep Arslan', generatedAt: '2025-02-18T20:11:00Z', plan: 'weekly', language: 'de', preview: 'Deine Musikreise zeigt...', featured: false },
];

// ─── Admin Revenue ─────────────────────────────────────────────────────────────

export const mockRevenueData: AdminRevenue[] = [
  { month: 'Eyl 24', revenue: 3200, weekly: 600, monthly: 1800, yearly: 800 },
  { month: 'Eki 24', revenue: 4800, weekly: 800, monthly: 2400, yearly: 1600 },
  { month: 'Kas 24', revenue: 6200, weekly: 900, monthly: 2900, yearly: 2400 },
  { month: 'Ara 24', revenue: 7800, weekly: 1000, monthly: 3200, yearly: 3600 },
  { month: 'Oca 25', revenue: 9400, weekly: 1200, monthly: 3800, yearly: 4400 },
  { month: 'Şub 25', revenue: 12480, weekly: 1480, monthly: 4480, yearly: 6520 },
];

export const mockTransactions: Transaction[] = [
  { id: 'tx1', userName: 'Ayşe Kaya', plan: 'yearly', amount: 39.99, currency: 'USD', date: '2025-02-15', status: 'completed' },
  { id: 'tx2', userName: 'Can Öztürk', plan: 'yearly', amount: 39.99, currency: 'USD', date: '2025-02-14', status: 'completed' },
  { id: 'tx3', userName: 'Fatma Şahin', plan: 'yearly', amount: 39.99, currency: 'USD', date: '2025-02-14', status: 'completed' },
  { id: 'tx4', userName: 'Mehmet Demir', plan: 'monthly', amount: 4.99, currency: 'USD', date: '2025-02-13', status: 'completed' },
  { id: 'tx5', userName: 'Zeynep Arslan', plan: 'weekly', amount: 1.99, currency: 'USD', date: '2025-02-12', status: 'completed' },
  { id: 'tx6', userName: 'Ahmet Yıldız', plan: 'yearly', amount: 39.99, currency: 'USD', date: '2025-02-11', status: 'refunded' },
];

// ─── Admin Analytics (User Fortune Aggregations) ────────────────────────────────

export const mockAnalytics: MockAnalytics = {
  platform: { spotify: 100 },
  timeOfDay: { morning: 18, afternoon: 32, evening: 28, night: 22 },
  topNightListeners: 2034,
  topMorningListeners: 1756,
  genreDistribution: [
    { genre: 'Indie Pop', count: 2104, percentage: 22.8 },
    { genre: 'Lo-fi', count: 1842, percentage: 19.9 },
    { genre: 'Phonk', count: 1298, percentage: 14.1 },
    { genre: 'R&B', count: 1123, percentage: 12.2 },
    { genre: 'Pop', count: 923, percentage: 10.0 },
    { genre: 'Rock', count: 647, percentage: 7.0 },
    { genre: 'Electronic', count: 462, percentage: 5.0 },
    { genre: 'Other', count: 1035, percentage: 11.2 },
  ],
  genderDistribution: { male: 52, female: 45, other: 3 },
  volumeDistribution: { high: 34, medium: 41, low: 25 },
};

// ─── App Settings ──────────────────────────────────────────────────────────────

export const mockAppSettings: AppSettings = {
  general: {
    siteActive: true,
    acceptNewRegistrations: true,
    maxFreeFortunes: 1,
    analysisPeriodDays: 14,
  },
  ai: {
    activeModel: 'meta/meta-llama-3-8b-instruct',
    fortunePromptTemplate: `Sen mistik bir müzik falcısısın. Kullanıcının son 14 günlük dinleme verilerine bakarak Türk kahve falı geleneğinden ilham alan, kişisel ve gizemli bir fal yorumu yaz. 4 paragraf, her biri 3-4 cümle. Akıcı ve şiirsel ol.`,
    maxTokens: 1024,
    temperature: 0.85,
    testMode: false,
  },
  pricing: {
    weeklyUSD: 1.99,
    monthlyUSD: 4.99,
    yearlyUSD: 39.99,
    activeCoupon: 'MUZIK25',
    couponDiscount: 25,
  },
  notifications: {
    bannerText: '🎵 Yeni özellik: Arkadaşınla müzik DNA\'sını karşılaştır!',
    bannerActive: true,
    bannerType: 'info',
  },
  sharing: {
    storyWatermarkText: 'musicifal.app ile oluşturuldu',
    ogImageTemplate: 'default',
    whatsappMessageTemplate: 'Müzik falıma bak! 🎵✨ {link}',
  },
};
