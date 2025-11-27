import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, Clip, Comment, Profile } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Heart, MessageCircle, Share2, MoreVertical, X, Send } from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ClipWithProfile extends Clip {
  profile: Profile
}

export default function ForYou() {
  const { user, profile: currentProfile } = useAuth()
  const [clips, setClips] = useState<ClipWithProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [likedClips, setLikedClips] = useState<Set<string>>(new Set())

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchClips()
    if (user) {
      fetchLikedClips()
    }
  }, [user])

  async function fetchClips() {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setClips((data as any) || [])
    } catch (error) {
      console.error('Error fetching clips:', error)
      toast.error('Failed to load clips')
    } finally {
      setLoading(false)
    }
  }

  async function fetchLikedClips() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('clip_likes')
        .select('clip_id')
        .eq('user_id', user.id)

      if (error) throw error

      const likedIds = new Set(data?.map(like => like.clip_id) || [])
      setLikedClips(likedIds)
    } catch (error) {
      console.error('Error fetching liked clips:', error)
    }
  }

  async function handleLike(clipId: string) {
    if (!user) {
      toast.error('Please log in to like clips')
      return
    }

    try {
      const isLiked = likedClips.has(clipId)

      if (isLiked) {
        await supabase
          .from('clip_likes')
          .delete()
          .eq('clip_id', clipId)
          .eq('user_id', user.id)

        setLikedClips(prev => {
          const newSet = new Set(prev)
          newSet.delete(clipId)
          return newSet
        })
      } else {
        await supabase
          .from('clip_likes')
          .insert({ clip_id: clipId, user_id: user.id })

        setLikedClips(prev => new Set(prev).add(clipId))
      }

      // Update local count
      setClips(prev => prev.map(clip =>
        clip.id === clipId
          ? { ...clip, likes: isLiked ? clip.likes - 1 : clip.likes + 1 }
          : clip
      ))
    } catch (error) {
      toast.error('Failed to like clip')
    }
  }

  async function handleShare(clip: Clip) {
    const url = `${window.location.origin}/${clip.profile?.username}`

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

  async function loadComments(clipId: string) {
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

  async function postComment() {
    if (!user || !newComment.trim()) return

    const currentClip = clips[currentIndex]
    if (!currentClip) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          clip_id: currentClip.id,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      loadComments(currentClip.id)
      toast.success('Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    }
  }

  function handleScroll(direction: 'up' | 'down') {
    if (direction === 'down' && currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleScroll('down')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleScroll('up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, clips.length])

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play()
          // Track view
          if (clips[index]) {
            supabase.from('clip_views').insert({
              clip_id: clips[index].id,
              viewer_id: user?.id || null,
            })
          }
        } else {
          video.pause()
        }
      }
    })
  }, [currentIndex, clips, user])

  useEffect(() => {
    if (showComments && clips[currentIndex]) {
      loadComments(clips[currentIndex].id)
    }
  }, [showComments, currentIndex])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (clips.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-2">No clips yet</p>
          <p className="text-dark-400">Be the first to upload!</p>
        </div>
      </div>
    )
  }

  const currentClip = clips[currentIndex]

  return (
    <div ref={containerRef} className="h-screen bg-black overflow-hidden relative">
      {/* Video Container */}
      <div className="absolute inset-0">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <video
              ref={el => videoRefs.current[index] = el}
              src={clip.video_url}
              className="w-full h-full object-contain bg-black"
              loop
              playsInline
              onClick={(e) => {
                const video = e.currentTarget
                if (video.paused) {
                  video.play()
                } else {
                  video.pause()
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Side - Clip Info */}
        <div className="absolute bottom-20 left-0 right-20 p-6 pointer-events-auto">
          <div className="max-w-md space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {currentClip.profile?.avatar_url ? (
                <img
                  src={currentClip.profile.avatar_url}
                  alt={currentClip.profile.username}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-dark-800 border-2 border-white" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">
                    @{currentClip.profile?.username}
                  </p>
                  {currentClip.profile?.is_verified && (
                    <span className="verified-badge text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-dark-300">{formatRelativeTime(currentClip.created_at)}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-medium leading-tight">
              {currentClip.title}
            </h3>

            {/* Description */}
            {currentClip.description && (
              <p className="text-white text-sm leading-relaxed">
                {currentClip.description}
              </p>
            )}

            {/* Game Tag */}
            {currentClip.game && (
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white border border-white/20">
                {currentClip.game}
              </span>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="absolute bottom-20 right-6 flex flex-col gap-6 pointer-events-auto">
          {/* Like */}
          <button
            onClick={() => handleLike(currentClip.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              likedClips.has(currentClip.id)
                ? 'bg-red-500'
                : 'bg-dark-800/50 backdrop-blur-md group-hover:bg-dark-700/50'
            }`}>
              <Heart
                className={`w-6 h-6 ${
                  likedClips.has(currentClip.id) ? 'fill-white text-white' : 'text-white'
                }`}
              />
            </div>
            <span className="text-white text-xs font-medium">
              {formatNumber(currentClip.likes)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-dark-800/50 backdrop-blur-md flex items-center justify-center group-hover:bg-dark-700/50 transition-all">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">
              {comments.length}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => handleShare(currentClip)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-dark-800/50 backdrop-blur-md flex items-center justify-center group-hover:bg-dark-700/50 transition-all">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Share</span>
          </button>

          {/* More */}
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-full bg-dark-800/50 backdrop-blur-md flex items-center justify-center group-hover:bg-dark-700/50 transition-all">
              <MoreVertical className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Scroll Indicators */}
        {currentIndex < clips.length - 1 && (
          <button
            onClick={() => handleScroll('down')}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 hover:text-white transition-colors pointer-events-auto"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-1 h-4 bg-current rounded-full animate-bounce" />
            </div>
          </button>
        )}
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center pointer-events-auto z-50">
          <div className="w-full max-w-2xl bg-dark-900 rounded-t-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
              <h3 className="font-semibold text-white">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-dark-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.profile?.avatar_url ? (
                      <img
                        src={comment.profile.avatar_url}
                        alt={comment.profile.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-dark-800" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          @{comment.profile?.username}
                        </span>
                        <span className="text-dark-500 text-xs">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {user ? (
              <div className="p-4 border-t border-dark-800">
                <div className="flex gap-3">
                  {currentProfile?.avatar_url ? (
                    <img
                      src={currentProfile.avatar_url}
                      alt="You"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-dark-800" />
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
                      className="flex-1 bg-dark-850 border border-dark-800 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                      maxLength={500}
                    />
                    <button
                      onClick={postComment}
                      disabled={!newComment.trim()}
                      className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-100 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-dark-800 text-center">
                <p className="text-dark-400 text-sm">
                  Please log in to comment
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
