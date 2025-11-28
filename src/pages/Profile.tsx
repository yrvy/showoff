import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Profile as ProfileType, Peripheral, GameRank, Clip } from '@/lib/supabase'
import {
  User,
  ExternalLink,
  Twitter,
  Twitch,
  Youtube,
  MessageCircle,
  Instagram,
  Eye,
  Heart,
  Play,
  Shield,
  Share2,
} from 'lucide-react'
import { formatRelativeTime, formatNumber, getGameIcon, getPeripheralIcon } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser, profile: currentProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  const [gameRanks, setGameRanks] = useState<GameRank[]>([])
  const [clips, setClips] = useState<Clip[]>([])
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  async function fetchProfile() {
    try {
      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setNotFound(true)
        }
        throw profileError
      }

      setProfile(profileData)

      // Track profile view (anonymous if not logged in)
      await supabase.from('profile_views').insert({
        profile_id: profileData.id,
        viewer_id: currentUser?.id || null,
      })

      // Fetch peripherals, game ranks, and clips
      const [peripheralsRes, gameRanksRes, clipsRes] = await Promise.all([
        supabase.from('peripherals').select('*').eq('user_id', profileData.id).order('display_order'),
        supabase.from('game_ranks').select('*').eq('user_id', profileData.id).order('is_primary', { ascending: false }),
        supabase.from('clips').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }).limit(20),
      ])

      if (peripheralsRes.error) throw peripheralsRes.error
      if (gameRanksRes.error) throw gameRanksRes.error
      if (clipsRes.error) throw clipsRes.error

      setPeripherals(peripheralsRes.data || [])
      setGameRanks(gameRanksRes.data || [])
      setClips(clipsRes.data || [])
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      if (!notFound) {
        toast.error('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleClipClick(clip: Clip) {
    setSelectedClip(clip)

    // Track view
    try {
      await supabase.from('clip_views').insert({
        clip_id: clip.id,
        viewer_id: currentUser?.id || null,
      })
    } catch (error) {
      console.error('Failed to track clip view:', error)
    }
  }

  async function handleLikeClip(clipId: string) {
    if (!currentUser) {
      toast.error('Please log in to like clips')
      return
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('clip_likes')
        .select('id')
        .eq('clip_id', clipId)
        .eq('user_id', currentUser.id)
        .single()

      if (existingLike) {
        // Unlike
        await supabase.from('clip_likes').delete().eq('id', existingLike.id)
        toast.success('Removed like')
      } else {
        // Like
        await supabase.from('clip_likes').insert({
          clip_id: clipId,
          user_id: currentUser.id,
        })
        toast.success('Liked!')
      }

      // Refresh clips
      fetchProfile()
    } catch (error: any) {
      toast.error('Failed to like clip')
    }
  }

  async function handleShareClip(clip: Clip) {
    if (!profile) return

    const url = `${window.location.origin}/${profile.username}/${clip.short_id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: clip.description || '',
          url: url,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">The user @{username} doesn't exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentProfile?.id === profile.id

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary-900/20 to-accent-900/20 overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-radial-primary"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-950"></div>
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-dark-950 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-dark-950 bg-dark-800 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-500" />
                </div>
              )}
            </div>

            {/* Name and Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <span className="verified-badge">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-2">@{profile.username}</p>
              {profile.bio && <p className="text-gray-300 max-w-2xl">{profile.bio}</p>}
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <Link to="/dashboard/edit" className="btn btn-primary">
                Edit Profile
              </Link>
            )}
          </div>

          {/* Social Links */}
          {(profile.twitter_url || profile.twitch_url || profile.youtube_url || profile.discord_tag || profile.instagram_url) && (
            <div className="flex flex-wrap gap-3 mt-4">
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-dark-900 hover:bg-dark-800 rounded-lg transition-all"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm">Twitter</span>
                </a>
              )}
              {profile.twitch_url && (
                <a
                  href={profile.twitch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-dark-900 hover:bg-dark-800 rounded-lg transition-all"
                >
                  <Twitch className="h-4 w-4" />
                  <span className="text-sm">Twitch</span>
                </a>
              )}
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-dark-900 hover:bg-dark-800 rounded-lg transition-all"
                >
                  <Youtube className="h-4 w-4" />
                  <span className="text-sm">YouTube</span>
                </a>
              )}
              {profile.discord_tag && (
                <div className="flex items-center gap-2 px-3 py-2 bg-dark-900 rounded-lg">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{profile.discord_tag}</span>
                </div>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-dark-900 hover:bg-dark-800 rounded-lg transition-all"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Game Ranks */}
        {gameRanks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Game Ranks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gameRanks.map((rank) => (
                <div key={rank.id} className="card text-center">
                  <div className="text-3xl mb-2">{getGameIcon(rank.game)}</div>
                  <p className="text-xs text-gray-500 uppercase mb-1">{rank.game}</p>
                  <p className="font-bold">{rank.rank_tier || rank.rank}</p>
                  {rank.hours_played && (
                    <p className="text-xs text-gray-500 mt-1">{rank.hours_played}h</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Peripherals */}
        {peripherals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peripherals.map((peripheral) => (
                <div key={peripheral.id} className="card group hover:border-primary-700 transition-all">
                  {peripheral.image_url && (
                    <img
                      src={peripheral.image_url}
                      alt={peripheral.model}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                        <span>{getPeripheralIcon(peripheral.category)}</span>
                        {peripheral.category}
                      </p>
                      <h3 className="font-bold">{peripheral.brand} {peripheral.model}</h3>
                      {peripheral.notes && (
                        <p className="text-sm text-gray-400 mt-1">{peripheral.notes}</p>
                      )}
                    </div>
                  </div>
                  {peripheral.purchase_url && (
                    <a
                      href={peripheral.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-2"
                    >
                      View Product <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clips */}
        {clips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Clips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="card p-0 overflow-hidden cursor-pointer group hover:border-primary-700 transition-all"
                  onClick={() => handleClipClick(clip)}
                >
                  <div className="relative">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-dark-800 flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 truncate">{clip.title}</h3>
                    {clip.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{clip.description}</p>
                    )}
                    {clip.game && (
                      <p className="text-xs text-gray-500 mb-2">{getGameIcon(clip.game)} {clip.game}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatNumber(clip.views)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikeClip(clip.id)
                        }}
                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        {formatNumber(clip.likes)}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareClip(clip)
                        }}
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <span className="ml-auto text-xs">{formatRelativeTime(clip.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {peripherals.length === 0 && gameRanks.length === 0 && clips.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">
              {isOwnProfile
                ? "You haven't added any content yet. Start building your profile!"
                : `@${profile.username} hasn't added any content yet.`}
            </p>
            {isOwnProfile && (
              <Link to="/dashboard" className="btn btn-primary mt-6">
                Go to Dashboard
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedClip && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedClip(null)}
        >
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <video
                src={selectedClip.video_url}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-2">{selectedClip.title}</h3>
              {selectedClip.description && (
                <p className="text-gray-400 mb-4">{selectedClip.description}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(selectedClip.views)} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {formatNumber(selectedClip.likes)} likes
                </span>
                <span className="ml-auto">{formatRelativeTime(selectedClip.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
