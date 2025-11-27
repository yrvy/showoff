import { supabase } from './supabase'

export type StorageBucket = 'avatars' | 'banners' | 'peripherals' | 'clips' | 'thumbnails'

export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  userId: string,
  customName?: string
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = customName || `${Date.now()}-${Math.random().toString(36).substring(7)}`
  const filePath = `${userId}/${fileName}.${fileExt}`

  const { error: uploadError, data } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

export async function deleteFile(bucket: StorageBucket, fileUrl: string): Promise<void> {
  // Extract the file path from the URL
  const url = new URL(fileUrl)
  const pathParts = url.pathname.split('/')
  const bucketIndex = pathParts.findIndex(part => part === bucket)
  const filePath = pathParts.slice(bucketIndex + 1).join('/')

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) throw error
}

export async function updateFile(
  bucket: StorageBucket,
  file: File,
  userId: string,
  oldFileUrl?: string
): Promise<string> {
  // Delete old file if exists
  if (oldFileUrl) {
    try {
      await deleteFile(bucket, oldFileUrl)
    } catch (error) {
      console.warn('Failed to delete old file:', error)
    }
  }

  // Upload new file
  return uploadFile(bucket, file, userId)
}

// Generate thumbnail from video file (using canvas)
export async function generateVideoThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(2, video.duration / 2) // Seek to 2 seconds or middle of video
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
      }, 'image/jpeg', 0.8)
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

// Get video duration
export async function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      resolve(Math.round(video.duration))
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}
