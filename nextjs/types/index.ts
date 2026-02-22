// ─── User & Auth ───────────────────────────────────────────────────────────────

export type Plan = 'free' | 'weekly' | 'monthly' | 'yearly';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  spotifyConnected: boolean;
  plan: Plan;
  joinedAt: string;
  lastAnalyzedAt: string;
}

// ─── Analysis Data ──────────────────────────────────────────────────────────────

export interface GenreData {
  name: string;
  percentage: number;
  mood: string;
  moodKey: string;  // for i18n: introspective, calm, aggressive, etc.
  color: string;
}

export interface TopArtist {
  rank: number;
  name: string;
  playCount: number;
  imageUrl: string;
  genre: string;
}

export interface TimeSlot {
  genre: string;
  mood: string;
  moodKey: string;  // for i18n
  trackCount: number;
}

export interface TimeOfDayData {
  morning: TimeSlot;
  afternoon: TimeSlot;
  evening: TimeSlot;
  night: TimeSlot;
}

export interface TopRepeatedSong {
  rank: number;
  name: string;
  artist: string;
  albumArt: string;
  repeatCount: number;
  valence: number;
  energy: number;
  danceability: number;
}

export interface TopSong {
  rank: number;
  name: string;
  artist: string;
  albumArt: string;
  playCount: number;
}

export type SpotifyDeviceType = 'Computer' | 'Smartphone' | 'Speaker' | 'TV' | 'CastAudio' | 'CastVideo' | 'Automobile' | string;

export interface SpotifyDevice {
  id: string;
  name: string;
  type: SpotifyDeviceType;
  isActive: boolean;
  volumePercent: number | null;
  supportsVolume: boolean;
}

export interface MockAnalysis {
  period: 'last_14_days';
  genres: GenreData[];
  topArtists: TopArtist[];
  timeOfDay: TimeOfDayData;
  topRepeated: TopRepeatedSong[];
  top50Songs: TopSong[];
  devices: SpotifyDevice[];
}

// ─── Fortune ───────────────────────────────────────────────────────────────────

export interface MockFortune {
  tr: string;
  en: string;
  de: string;
  ru: string;
  generatedAt: string;
  isPro: boolean;
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface DailySignup {
  date: string;
  count: number;
}

export interface CountryData {
  country: string;
  users: number;
  percentage: number;
}

export interface PlanDistribution {
  free: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface MockAdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalFortunes: number;
  dailySignups: DailySignup[];
  conversionRate: number;
  topCountries: CountryData[];
  planDistribution: PlanDistribution;
}

// ─── Admin Tables ──────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: Plan;
  joinedAt: string;
  lastLogin: string;
  source: 'spotify' | 'direct';
  fortuneCount: number;
  status: 'active' | 'suspended';
  /** For admin filtering */
  gender?: 'male' | 'female' | 'other';
}

export interface AdminAnalysis {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  analyzedAt: string;
  platform: 'spotify';
  plan: Plan;
  dominantGenre: string;
  processingMs: number;
  /** For admin filtering */
  gender?: 'male' | 'female' | 'other';
}

export interface AdminFortune {
  id: string;
  userId: string;
  userName: string;
  generatedAt: string;
  plan: Plan;
  language: 'tr' | 'en' | 'de' | 'ru';
  preview: string;
  featured: boolean;
}

export interface AdminRevenue {
  month: string;
  revenue: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Transaction {
  id: string;
  userName: string;
  plan: Plan;
  amount: number;
  currency: 'USD';
  date: string;
  status: 'completed' | 'refunded' | 'failed';
}

// ─── App Settings ──────────────────────────────────────────────────────────────

export interface AppSettings {
  general: {
    siteActive: boolean;
    acceptNewRegistrations: boolean;
    maxFreeFortunes: number;
    analysisPeriodDays: number;
  };
  ai: {
    activeModel: string;
    fortunePromptTemplate: string;
    maxTokens: number;
    temperature: number;
    testMode: boolean;
  };
  pricing: {
    weeklyUSD: number;
    monthlyUSD: number;
    yearlyUSD: number;
    activeCoupon: string;
    couponDiscount: number;
  };
  notifications: {
    bannerText: string;
    bannerActive: boolean;
    bannerType: 'info' | 'warning' | 'success';
  };
  sharing: {
    storyWatermarkText: string;
    ogImageTemplate: string;
    whatsappMessageTemplate: string;
  };
}

// ─── Admin Filters ───────────────────────────────────────────────────────────────

export type AdminPlatformFilter = 'spotify' | 'all';
export type AdminGenderFilter = 'male' | 'female' | 'other' | 'all';

export interface AdminFilters {
  plan: Plan | 'all';
  platform: AdminPlatformFilter;
  gender: AdminGenderFilter;
  genre: string | 'all';
}

// ─── Admin Analytics (User Fortune Aggregations) ─────────────────────────────────

export interface PlatformDistribution {
  spotify: number;
}

export interface TimeOfDayDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface GenreDistribution {
  genre: string;
  count: number;
  percentage: number;
}

export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
}

export interface VolumeDistribution {
  high: number;   // 80-100
  medium: number; // 50-79
  low: number;    // 0-49
}

export interface MockAnalytics {
  platform: PlatformDistribution;
  timeOfDay: TimeOfDayDistribution;
  topNightListeners: number;
  topMorningListeners: number;
  genreDistribution: GenreDistribution[];
  genderDistribution: GenderDistribution;
  volumeDistribution: VolumeDistribution;
}

// ─── i18n ──────────────────────────────────────────────────────────────────────

export type Locale = 'tr' | 'en' | 'de' | 'ru';
