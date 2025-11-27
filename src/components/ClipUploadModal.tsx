import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile, generateVideoThumbnail, getVideoDuration } from '@/lib/storage'
import { X, Upload, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClipUploadModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ClipUploadModal({ onClose, onSuccess }: ClipUploadModalProps) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [game, setGame] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 524288000) {
        toast.error('Video file is too large. Maximum size is 500MB.')
        return
      }
      setVideoFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile || !profile) return

    setUploading(true)
    setProgress(10)

    try {
      // Get video duration
      setProgress(20)
      const duration = await getVideoDuration(videoFile)

      // Upload video
      setProgress(40)
      const videoUrl = await uploadFile('clips', videoFile, profile.id)

      // Generate and upload thumbnail
      setProgress(60)
      let thumbnailUrl: string | null = null
      try {
        const thumbnailBlob = await generateVideoThumbnail(videoFile)
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
        thumbnailUrl = await uploadFile('thumbnails', thumbnailFile, profile.id)
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error)
      }

      // Create clip record
      setProgress(80)
      const { error } = await supabase.from('clips').insert({
        user_id: profile.id,
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        game: game || null,
        duration,
        file_size: videoFile.size,
      })

      if (error) throw error

      setProgress(100)
      toast.success('Clip uploaded successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload clip')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upload Clip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={uploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video File *</label>
            <div className="relative">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                required
                disabled={uploading}
              />
              <label
                htmlFor="video-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-primary-600 transition-all ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-6 w-6" />
                <span>{videoFile ? videoFile.name : 'Choose video file (max 500MB)'}</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="My epic clutch"
              maxLength={100}
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              placeholder="Describe your clip..."
              rows={3}
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="game" className="block text-sm font-medium mb-2">
              Game
            </label>
            <select
              id="game"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="input"
              disabled={uploading}
            >
              <option value="">Select a game</option>
              <option value="valorant">Valorant</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="r6">Rainbow Six Siege</option>
              <option value="apex">Apex Legends</option>
              <option value="league">League of Legends</option>
              <option value="overwatch">Overwatch 2</option>
              <option value="fortnite">Fortnite</option>
              <option value="cod">Call of Duty</option>
              <option value="other">Other</option>
            </select>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Uploading...</span>
                <span className="text-primary-400">{progress}%</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={uploading || !videoFile}
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Clip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
