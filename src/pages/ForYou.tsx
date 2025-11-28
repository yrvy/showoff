import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Clip, Comment, Profile } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Heart, MessageCircle, Share2, X, Send, ChevronUp, ChevronDown } from 'lucide-react'
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
  const [isTransitioning, setIsTransitioning] = useState(false)

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

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
        .limit(50)

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

      setClips(prev => prev.map(clip =>
        clip.id === clipId
          ? { ...clip, likes: isLiked ? clip.likes - 1 : clip.likes + 1 }
          : clip
      ))
    } catch (error) {
      toast.error('Failed to like clip')
    }
  }

  async function handleShare(clip: ClipWithProfile) {
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

  function scrollToClip(index: number) {
    if (isTransitioning || index < 0 || index >= clips.length) return

    setIsTransitioning(true)
    setCurrentIndex(index)

    setTimeout(() => setIsTransitioning(false), 500)
  }

  // Handle wheel scroll
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning || showComments) return

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0 && currentIndex < clips.length - 1) {
          scrollToClip(currentIndex + 1)
        } else if (e.deltaY < 0 && currentIndex > 0) {
          scrollToClip(currentIndex - 1)
        }
      }, 50)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      clearTimeout(scrollTimeout)
    }
  }, [currentIndex, clips.length, isTransitioning, showComments])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        scrollToClip(currentIndex + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        scrollToClip(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, clips.length, showComments])

  // Play/pause videos
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play()
          if (clips[index]) {
            supabase.from('clip_views').insert({
              clip_id: clips[index].id,
              viewer_id: user?.id || null,
            })
          }
        } else {
          video.pause()
          video.currentTime = 0
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
          <p className="text-white text-sm">Loading clips...</p>
        </div>
      </div>
    )
  }

  if (clips.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📹</div>
          <h2 className="text-2xl font-bold mb-2">No clips yet</h2>
          <p className="text-dark-400 mb-6">Be the first to share your gaming moments!</p>
          {user && (
            <Link to="/dashboard" className="btn btn-primary">
              Upload Your First Clip
            </Link>
          )}
        </div>
      </div>
    )
  }

  const currentClip = clips[currentIndex]

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {/* Video Container with smooth transitions */}
      <div className="absolute inset-0">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : index < currentIndex
                ? 'opacity-0 scale-95 -translate-y-full'
                : 'opacity-0 scale-95 translate-y-full'
            }`}
            style={{ pointerEvents: index === currentIndex ? 'auto' : 'none' }}
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

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Side - Clip Info */}
        <div className="absolute bottom-24 left-0 right-24 p-6 pointer-events-auto">
          <div className="max-w-lg space-y-4 animate-fade-in">
            {/* User Info - Clickable */}
            <Link
              to={`/${currentClip.profile?.username}`}
              className="flex items-center gap-3 group w-fit"
            >
              {currentClip.profile?.avatar_url ? (
                <img
                  src={currentClip.profile.avatar_url}
                  alt={currentClip.profile.username}
                  className="w-12 h-12 rounded-full border-2 border-white/80 group-hover:border-white transition-all group-hover:scale-105"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-dark-800 border-2 border-white/80 group-hover:border-white transition-all" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white group-hover:text-white/90 transition-colors">
                    @{currentClip.profile?.username}
                  </p>
                  {currentClip.profile?.is_verified && (
                    <span className="verified-badge text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-white/60">{formatRelativeTime(currentClip.created_at)}</p>
              </div>
            </Link>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold leading-tight">
              {currentClip.title}
            </h3>

            {/* Description */}
            {currentClip.description && (
              <p className="text-white/90 text-base leading-relaxed line-clamp-3">
                {currentClip.description}
              </p>
            )}

            {/* Game Tag */}
            {currentClip.game && (
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-sm text-white border border-white/20 font-medium">
                {currentClip.game.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="absolute bottom-24 right-6 flex flex-col gap-5 pointer-events-auto animate-slide-left">
          {/* Like */}
          <button
            onClick={() => handleLike(currentClip.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
              likedClips.has(currentClip.id)
                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                : 'bg-white/10 backdrop-blur-xl group-hover:bg-white/20 border border-white/20'
            }`}>
              <Heart
                className={`w-7 h-7 transition-all ${
                  likedClips.has(currentClip.id) ? 'fill-white text-white scale-110' : 'text-white'
                }`}
              />
            </div>
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {formatNumber(currentClip.likes)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/20 transition-all transform hover:scale-110 border border-white/20">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {comments.length}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => handleShare(currentClip)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/20 transition-all transform hover:scale-110 border border-white/20">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-lg">Share</span>
          </button>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => scrollToClip(currentIndex - 1)}
            className="absolute top-1/2 left-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all pointer-events-auto border border-white/20"
          >
            <ChevronUp className="w-6 h-6 text-white" />
          </button>
        )}

        {currentIndex < clips.length - 1 && (
          <button
            onClick={() => scrollToClip(currentIndex + 1)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all pointer-events-auto animate-bounce border border-white/20"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Progress Indicator */}
        <div className="absolute top-6 right-6 pointer-events-auto">
          <div className="text-white/60 text-sm font-medium bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
            {currentIndex + 1} / {clips.length}
          </div>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center pointer-events-auto z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-dark-900 rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up shadow-2xl border-t border-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-800">
              <h3 className="font-semibold text-white text-lg">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-dark-400 hover:text-white transition-colors p-1 hover:bg-dark-800 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
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

            {/* Comment Input */}
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
      )}
    </div>
  )
}
