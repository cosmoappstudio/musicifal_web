/**
 * Supabase Database types (generated from schema)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          spotify_user_id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'starter' | 'pro';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spotify_user_id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'starter' | 'pro';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      spotify_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['spotify_tokens']['Insert']>;
      };
      spotify_raw_data: {
        Row: {
          id: string;
          user_id: string;
          profile: Json | null;
          recently_played: Json | null;
          top_artists_short: Json | null;
          top_artists_medium: Json | null;
          top_artists_long: Json | null;
          top_tracks_short: Json | null;
          top_tracks_medium: Json | null;
          top_tracks_long: Json | null;
          audio_features: Json | null;
          devices: Json | null;
          fetched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile?: Json | null;
          recently_played?: Json | null;
          top_artists_short?: Json | null;
          top_artists_medium?: Json | null;
          top_artists_long?: Json | null;
          top_tracks_short?: Json | null;
          top_tracks_medium?: Json | null;
          top_tracks_long?: Json | null;
          audio_features?: Json | null;
          devices?: Json | null;
          fetched_at: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['spotify_raw_data']['Insert']>;
      };
    };
  };
}
