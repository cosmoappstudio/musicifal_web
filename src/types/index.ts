export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  product?: string; // Spotify product level (free/premium)
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  played_at?: string; // For recently played
  popularity?: number;
}

export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  images?: Image[];
  popularity?: number;
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
  release_date: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  instrumentalness: number;
  acousticness: number;
}

export interface GenreStat {
  name: string;
  percentage: number;
  mood: string; // Mapped mood
}

export interface TimeBucket {
  label: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  dominantGenre: string;
  percentage: number;
}

export interface DeviceStat {
  type: string; // Computer, Phone, etc.
  topGenre: string;
  avgVolume: number; // 0-100
  usagePercentage: number;
}

export interface RepeatedSong {
  track: Track;
  count: number;
  features?: AudioFeatures;
  lyricTheme?: string;
}

// The core object sent to AI
export interface MusicAnalysis {
  userId: string;
  dateRange: { start: string; end: string };
  topGenres: GenreStat[];
  topArtists: Artist[]; // Top 10
  timePatterns: TimeBucket[];
  deviceBehavior: DeviceStat[];
  repeatedSongs: RepeatedSong[]; // Top 3
  dominantMood: string;
}

export interface FortuneResult {
  tr: string;
  en: string;
  de: string;
  ru: string;
}
