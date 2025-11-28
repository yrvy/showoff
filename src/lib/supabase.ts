import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types
export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
  twitter_url: string | null
  twitch_url: string | null
  youtube_url: string | null
  discord_tag: string | null
  instagram_url: string | null
}

export interface Peripheral {
  id: string
  user_id: string
  category: 'mouse' | 'keyboard' | 'mousepad' | 'headset' | 'monitor' | 'microphone' | 'controller' | 'chair' | 'other'
  brand: string
  model: string
  image_url: string | null
  purchase_url: string | null
  notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface GameRank {
  id: string
  user_id: string
  game: 'valorant' | 'cs2' | 'r6' | 'apex' | 'league' | 'overwatch' | 'fortnite' | 'cod' | 'other'
  rank: string
  rank_tier: string | null
  peak_rank: string | null
  hours_played: number | null
  icon_url: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Clip {
  id: string
  user_id: string
  short_id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  game: string | null
  duration: number | null
  file_size: number | null
  views: number
  likes: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface ClipLike {
  id: string
  clip_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  clip_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  last_read_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  updated_at: string
  is_read: boolean
  sender?: Profile
}

export interface ProfileStats {
  follower_count: number
  following_count: number
  total_likes: number
  total_views: number
}
