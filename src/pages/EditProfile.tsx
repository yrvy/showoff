import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/storage'
import { isValidUsername } from '@/lib/utils'
import { Upload, Loader, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditProfile() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [twitchUrl, setTwitchUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [discordTag, setDiscordTag] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setTwitterUrl(profile.twitter_url || '')
      setTwitchUrl(profile.twitch_url || '')
      setYoutubeUrl(profile.youtube_url || '')
      setDiscordTag(profile.discord_tag || '')
      setInstagramUrl(profile.instagram_url || '')
    }
  }, [profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5242880) {
        toast.error('Avatar file is too large. Maximum size is 5MB.')
        return
      }
      setAvatarFile(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10485760) {
        toast.error('Banner file is too large. Maximum size is 10MB.')
        return
      }
      setBannerFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    if (!isValidUsername(username)) {
      toast.error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens')
      return
    }

    setLoading(true)

    try {
      let avatarUrl = profile.avatar_url
      let bannerUrl = profile.banner_url

      if (avatarFile) {
        avatarUrl = await uploadFile('avatars', avatarFile, profile.id)
      }

      if (bannerFile) {
        bannerUrl = await uploadFile('banners', bannerFile, profile.id)
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          display_name: displayName || null,
          bio: bio || null,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          twitter_url: twitterUrl || null,
          twitch_url: twitchUrl || null,
          youtube_url: youtubeUrl || null,
          discord_tag: discordTag || null,
          instagram_url: instagramUrl || null,
        })
        .eq('id', profile.id)

      if (error) {
        if (error.message.includes('username')) {
          toast.error('This username is already taken')
        } else {
          throw error
        }
      } else {
        toast.success('Profile updated successfully!')
        navigate(`/${username}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Banner Image</label>
            {profile.banner_url && !bannerFile && (
              <img
                src={profile.banner_url}
                alt="Current banner"
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              id="banner-upload"
              disabled={loading}
            />
            <label
              htmlFor="banner-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-primary-600 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>{bannerFile ? bannerFile.name : 'Upload banner (max 10MB, recommended: 1920x400)'}</span>
            </label>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Avatar Image</label>
            <div className="flex items-center gap-4">
              {profile.avatar_url && !avatarFile && (
                <img
                  src={profile.avatar_url}
                  alt="Current avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-primary-600 transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <span>{avatarFile ? avatarFile.name : 'Upload avatar (max 5MB, square recommended)'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="input"
                required
                minLength={3}
                maxLength={30}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your Name"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea"
              placeholder="Tell us about yourself..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="border-t border-dark-800 pt-6">
            <h2 className="text-xl font-bold mb-4">Social Links</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium mb-2">
                  Twitter
                </label>
                <input
                  id="twitterUrl"
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="input"
                  placeholder="https://twitter.com/username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="twitchUrl" className="block text-sm font-medium mb-2">
                  Twitch
                </label>
                <input
                  id="twitchUrl"
                  type="url"
                  value={twitchUrl}
                  onChange={(e) => setTwitchUrl(e.target.value)}
                  className="input"
                  placeholder="https://twitch.tv/username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="youtubeUrl" className="block text-sm font-medium mb-2">
                  YouTube
                </label>
                <input
                  id="youtubeUrl"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input"
                  placeholder="https://youtube.com/@username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="discordTag" className="block text-sm font-medium mb-2">
                  Discord Tag
                </label>
                <input
                  id="discordTag"
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  className="input"
                  placeholder="username#0000"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium mb-2">
                  Instagram
                </label>
                <input
                  id="instagramUrl"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="input"
                  placeholder="https://instagram.com/username"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
