import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase, Clip, Profile, Comment } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Heart, MessageCircle, Share2, Send, ArrowLeft } from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ClipWithProfile extends Clip {
  profile: Profile
}

export default function ClipPage() {
  const { username, clipId } = useParams<{ username: string; clipId: string }>()
  const navigate = useNavigate()
  const { user, profile: currentProfile } = useAuth()
  const [clip, setClip] = useState<ClipWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (username && clipId) {
      fetchClip()
      fetchComments()
      if (user) {
        checkIfLiked()
      }
    }
  }, [username, clipId, user])

  async function fetchClip() {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', clipId)
        .single()

      if (error) throw error

      const clipData = data as any as ClipWithProfile

      // Verify username matches
      if (clipData.profile?.username !== username) {
        navigate('/404')
        return
      }

      setClip(clipData)

      // Record view
      await supabase.from('clip_views').insert({
        clip_id: clipData.id,
        viewer_id: user?.id || null,
      })
    } catch (error) {
      console.error('Error fetching clip:', error)
      navigate('/404')
    } finally {
      setLoading(false)
    }
  }

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('clip_id', clipId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setComments((data as any) || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  async function checkIfLiked() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('clip_likes')
        .select('id')
        .eq('clip_id', clipId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      setIsLiked(!!data)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  async function handleLike() {
    if (!user) {
      toast.error('Please log in to like clips')
      return
    }

    if (!clip) return

    try {
      if (isLiked) {
        await supabase
          .from('clip_likes')
          .delete()
          .eq('clip_id', clip.id)
          .eq('user_id', user.id)

        setIsLiked(false)
        setClip({ ...clip, likes: clip.likes - 1 })
      } else {
        await supabase
          .from('clip_likes')
          .insert({ clip_id: clip.id, user_id: user.id })

        setIsLiked(true)
        setClip({ ...clip, likes: clip.likes + 1 })
      }
    } catch (error) {
      toast.error('Failed to like clip')
    }
  }

  async function handleShare() {
    if (!clip) return

    const url = `${window.location.origin}/${clip.profile?.username}/${clip.id}`

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

  async function postComment() {
    if (!user || !newComment.trim() || !clip) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          clip_id: clip.id,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      fetchComments()
      toast.success('Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
          <p className="text-white text-sm">Loading clip...</p>
        </div>
      </div>
    )
  }

  if (!clip) {
    return null
  }

  const siteUrl = 'https://www.showoff.wtf'
  const clipUrl = `${siteUrl}/${clip.profile?.username}/${clip.id}`

  return (
    <>
      <Helmet>
        <title>{clip.title} - @{clip.profile?.username} | ShowOff</title>
        <meta name="description" content={clip.description || `Watch ${clip.title} by @${clip.profile?.username} on ShowOff`} />

        {/* OpenGraph tags for Discord/social embeds */}
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={clip.title} />
        <meta property="og:description" content={clip.description || `Watch this clip by @${clip.profile?.username}`} />
        <meta property="og:url" content={clipUrl} />
        <meta property="og:site_name" content="ShowOff" />
        <meta property="og:video" content={clip.video_url} />
        <meta property="og:video:url" content={clip.video_url} />
        <meta property="og:video:secure_url" content={clip.video_url} />
        <meta property="og:video:type" content="video/mp4" />
        {clip.thumbnail_url && <meta property="og:image" content={clip.thumbnail_url} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={clip.title} />
        <meta name="twitter:description" content={clip.description || `Watch this clip by @${clip.profile?.username}`} />
        {clip.thumbnail_url && <meta name="twitter:image" content={clip.thumbnail_url} />}
        <meta name="twitter:player" content={clip.video_url} />

        {/* Additional metadata */}
        <meta property="video:duration" content="60" />
        <meta property="video:release_date" content={clip.created_at} />

        {/* Discord-specific embeds */}
        <meta name="theme-color" content="#FFFFFF" />
        <meta property="og:author" content={`@${clip.profile?.username}`} />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-dark-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-dark-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{clip.title}</h1>
              <Link
                to={`/${clip.profile?.username}`}
                className="text-sm text-dark-400 hover:text-white transition-colors"
              >
                @{clip.profile?.username}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Section */}
            <div className="lg:col-span-2">
              <div className="bg-dark-900 rounded-2xl overflow-hidden border border-dark-800">
                <video
                  src={clip.video_url}
                  controls
                  autoPlay
                  loop
                  className="w-full aspect-video bg-black"
                  poster={clip.thumbnail_url || undefined}
                />
              </div>

              {/* Clip Info */}
              <div className="mt-6 space-y-6">
                {/* User Info */}
                <Link
                  to={`/${clip.profile?.username}`}
                  className="flex items-center gap-4 group"
                >
                  {clip.profile?.avatar_url ? (
                    <img
                      src={clip.profile.avatar_url}
                      alt={clip.profile.username}
                      className="w-14 h-14 rounded-full border-2 border-dark-700 group-hover:border-white transition-all"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-dark-800 border-2 border-dark-700" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white group-hover:text-dark-100 transition-colors">
                        @{clip.profile?.username}
                      </p>
                      {clip.profile?.is_verified && (
                        <span className="verified-badge">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-dark-400">{formatRelativeTime(clip.created_at)}</p>
                  </div>
                </Link>

                {/* Description */}
                {clip.description && (
                  <div className="bg-dark-900 rounded-xl p-5 border border-dark-800">
                    <p className="text-white/90 leading-relaxed">{clip.description}</p>
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium ${
                      isLiked
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-dark-800 text-white hover:bg-dark-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                    <span>{formatNumber(clip.likes)}</span>
                  </button>

                  <div className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 rounded-full text-white">
                    <MessageCircle className="w-5 h-5" />
                    <span>{comments.length}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-full transition-all text-white font-medium"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {clip.game && (
                  <div>
                    <span className="inline-block px-4 py-2 bg-dark-800 rounded-full text-sm font-medium border border-dark-700">
                      {clip.game.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="lg:col-span-1">
              <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden sticky top-24 max-h-[calc(100vh-8rem)]">
                <div className="p-5 border-b border-dark-800">
                  <h3 className="font-semibold text-white text-lg">
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[60vh] p-5 space-y-5">
                  {comments.length === 0 ? (
                    <div className="text-center py-16 text-dark-400">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No comments yet</p>
                      <p className="text-sm mt-1">Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-3 animate-fade-in">
                        <Link to={`/${comment.profile?.username}`}>
                          {comment.profile?.avatar_url ? (
                            <img
                              src={comment.profile.avatar_url}
                              alt={comment.profile.username}
                              className="w-9 h-9 rounded-full hover:ring-2 ring-white transition-all"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-dark-800" />
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/${comment.profile?.username}`}
                              className="font-medium text-white text-sm hover:underline"
                            >
                              @{comment.profile?.username}
                            </Link>
                            <span className="text-dark-500 text-xs">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {user ? (
                  <div className="p-5 border-t border-dark-800 bg-dark-850">
                    <div className="flex gap-3">
                      {currentProfile?.avatar_url ? (
                        <img
                          src={currentProfile.avatar_url}
                          alt="You"
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-dark-800" />
                      )}
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              postComment()
                            }
                          }}
                          placeholder="Add a comment..."
                          className="flex-1 bg-dark-800 border border-dark-700 rounded-full px-5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 placeholder-dark-500"
                          maxLength={500}
                        />
                        <button
                          onClick={postComment}
                          disabled={!newComment.trim()}
                          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-100 transition-all disabled:hover:bg-white"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border-t border-dark-800 text-center bg-dark-850">
                    <p className="text-dark-400 text-sm mb-3">
                      Please log in to comment
                    </p>
                    <Link to="/login" className="btn btn-primary text-sm">
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
