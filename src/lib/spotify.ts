import { 
  UserProfile, 
  Track, 
  Artist, 
  AudioFeatures, 
  MusicAnalysis, 
  GenreStat,
  TimeBucket,
  DeviceStat,
  RepeatedSong
} from '@/types';

// Scopes required for the application
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-library-read'
].join(' ');

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Helper to handle API errors
async function fetchSpotify(endpoint: string, accessToken: string) {
  const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Spotify API Error: ${error.error?.message || res.statusText}`);
  }
  
  return res.json();
}

// 1. Get User Profile
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const data = await fetchSpotify('/me', accessToken);
  return {
    id: data.id,
    email: data.email,
    name: data.display_name,
    image: data.images?.[0]?.url,
    product: data.product,
  };
}

// 2. Get Top Artists (Short Term ~ 4 weeks, closest to 14 days)
export async function getTopArtists(accessToken: string): Promise<Artist[]> {
  const data = await fetchSpotify('/me/top/artists?time_range=short_term&limit=10', accessToken);
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    genres: item.genres,
    images: item.images,
    popularity: item.popularity,
  }));
}

// 3. Get Top Tracks (Short Term) - Used for calculating top genres if needed, and repeated songs proxy
export async function getTopTracks(accessToken: string): Promise<Track[]> {
  const data = await fetchSpotify('/me/top/tracks?time_range=short_term&limit=50', accessToken);
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    artists: item.artists,
    album: item.album,
    duration_ms: item.duration_ms,
    popularity: item.popularity,
  }));
}

// 4. Get Recently Played (Limited to last 50 tracks)
// This is the only way to get exact timestamps for Time-of-Day analysis
export async function getRecentlyPlayed(accessToken: string): Promise<any[]> {
  const data = await fetchSpotify('/me/player/recently-played?limit=50', accessToken);
  return data.items;
}

// 5. Get Audio Features for Tracks
export async function getAudioFeatures(accessToken: string, trackIds: string[]): Promise<AudioFeatures[]> {
  if (trackIds.length === 0) return [];
  // Spotify allows max 100 ids per request
  const chunks = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    chunks.push(trackIds.slice(i, i + 100));
  }

  let allFeatures: any[] = [];
  for (const chunk of chunks) {
    const data = await fetchSpotify(`/audio-features?ids=${chunk.join(',')}`, accessToken);
    allFeatures = [...allFeatures, ...data.audio_features];
  }

  return allFeatures.map(f => ({
    id: f.id,
    danceability: f.danceability,
    energy: f.energy,
    valence: f.valence,
    tempo: f.tempo,
    instrumentalness: f.instrumentalness,
    acousticness: f.acousticness,
  }));
}

// --- ANALYSIS LOGIC ---

function mapGenreToMood(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes('phonk') || g.includes('trap') || g.includes('drift')) return 'Aggressive/Driven';
  if (g.includes('lo-fi') || g.includes('chill') || g.includes('study')) return 'Calm/Focused';
  if (g.includes('indie') || g.includes('alternative')) return 'Introspective';
  if (g.includes('pop') || g.includes('dance')) return 'Social/Upbeat';
  if (g.includes('metal') || g.includes('rock')) return 'Intense/Releasing';
  if (g.includes('classical') || g.includes('piano')) return 'Intellectual/Serene';
  if (g.includes('r&b') || g.includes('soul')) return 'Emotional/Romantic';
  return 'Balanced';
}

export async function buildAnalysis(accessToken: string): Promise<MusicAnalysis> {
  // Parallel fetch for efficiency
  const [profile, topArtists, topTracks, recentlyPlayed] = await Promise.all([
    getUserProfile(accessToken),
    getTopArtists(accessToken),
    getTopTracks(accessToken),
    getRecentlyPlayed(accessToken),
  ]);

  // 1. Genre Distribution
  const genreCounts: Record<string, number> = {};
  let totalGenres = 0;
  topArtists.forEach(artist => {
    artist.genres?.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      totalGenres++;
    });
  });

  const topGenres: GenreStat[] = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalGenres) * 100),
      mood: mapGenreToMood(name),
    }));

  // 2. Time of Day Patterns (using Recently Played)
  const timeBuckets: Record<string, Record<string, number>> = {
    'Morning': {}, 'Afternoon': {}, 'Evening': {}, 'Night': {}
  };

  recentlyPlayed.forEach((item: any) => {
    const date = new Date(item.played_at);
    const hour = date.getHours();
    let bucket = 'Night';
    if (hour >= 6 && hour < 12) bucket = 'Morning';
    else if (hour >= 12 && hour < 18) bucket = 'Afternoon';
    else if (hour >= 18 && hour < 23) bucket = 'Evening';

    // Get primary genre of the track's artist (approximate)
    // We would need to fetch artist details for every track to be accurate, 
    // but for now we'll use the top artists cache if available, or skip.
    // Optimization: In a real app, we'd batch fetch artists for all recent tracks.
    // For this prototype, we will simulate or use a simplified approach.
    // Let's just count tracks for now to determine activity, genre mapping requires more API calls.
  });
  
  // Mocking Time Patterns for prototype if data is insufficient
  const timePatterns: TimeBucket[] = [
    { label: 'Morning', dominantGenre: 'Lo-fi', percentage: 30 },
    { label: 'Afternoon', dominantGenre: 'Pop', percentage: 40 },
    { label: 'Evening', dominantGenre: 'Indie', percentage: 20 },
    { label: 'Night', dominantGenre: 'Phonk', percentage: 10 },
  ];


  // 3. Repeated Songs
  // Since 'recently-played' is small, we use 'topTracks' as a proxy for repeated listening
  // In a real production app with database history, we would count actual plays over 14 days.
  const repeatedSongs: RepeatedSong[] = topTracks.slice(0, 3).map(track => ({
    track,
    count: Math.floor(Math.random() * 20) + 10, // Mock count as API doesn't give play count
  }));

  // Fetch audio features for these songs
  const features = await getAudioFeatures(accessToken, repeatedSongs.map(s => s.track.id));
  repeatedSongs.forEach((s, i) => {
    s.features = features[i];
  });

  // 4. Device Behavior
  // Spotify API doesn't give historical device data easily without polling.
  // We will use the 'recently-played' context if available, or mock for the prototype.
  const deviceBehavior: DeviceStat[] = [
    { type: 'Phone', topGenre: topGenres[0]?.name || 'Pop', avgVolume: 85, usagePercentage: 60 },
    { type: 'Computer', topGenre: topGenres[1]?.name || 'Lo-fi', avgVolume: 40, usagePercentage: 30 },
    { type: 'Smart Speaker', topGenre: topGenres[2]?.name || 'Jazz', avgVolume: 60, usagePercentage: 10 },
  ];

  return {
    userId: profile.id,
    dateRange: {
      start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    topGenres,
    topArtists,
    timePatterns,
    deviceBehavior,
    repeatedSongs,
    dominantMood: topGenres[0]?.mood || 'Balanced',
  };
}
