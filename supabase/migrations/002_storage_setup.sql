-- ShowOff Gaming Profile Platform - Storage Setup
-- This migration creates storage buckets and policies for file uploads

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for profile banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'banners',
    'banners',
    true,
    10485760, -- 10MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for peripheral images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'peripherals',
    'peripherals',
    true,
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for game clips (videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'clips',
    'clips',
    true,
    524288000, -- 500MB limit
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for clip thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails',
    true,
    2097152, -- 2MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES - AVATARS
-- =============================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- STORAGE POLICIES - BANNERS
-- =============================================

-- Anyone can view banners (public bucket)
CREATE POLICY "Banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Authenticated users can upload their own banner
CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own banner
CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own banner
CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- STORAGE POLICIES - PERIPHERALS
-- =============================================

-- Anyone can view peripheral images (public bucket)
CREATE POLICY "Peripheral images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'peripherals');

-- Authenticated users can upload peripheral images
CREATE POLICY "Users can upload peripheral images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'peripherals'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own peripheral images
CREATE POLICY "Users can update their own peripheral images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'peripherals'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own peripheral images
CREATE POLICY "Users can delete their own peripheral images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'peripherals'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- STORAGE POLICIES - CLIPS
-- =============================================

-- Anyone can view clips (public bucket)
CREATE POLICY "Clips are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'clips');

-- Authenticated users can upload their own clips
CREATE POLICY "Users can upload their own clips"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'clips'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own clips
CREATE POLICY "Users can update their own clips"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'clips'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own clips
CREATE POLICY "Users can delete their own clips"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'clips'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- STORAGE POLICIES - THUMBNAILS
-- =============================================

-- Anyone can view thumbnails (public bucket)
CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Authenticated users can upload their own thumbnails
CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own thumbnails
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own thumbnails
CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
