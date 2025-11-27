-- ShowOff Gaming Profile Platform - Initial Schema
-- This migration creates all required tables, storage, and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Social links
    twitter_url TEXT,
    twitch_url TEXT,
    youtube_url TEXT,
    discord_tag TEXT,
    instagram_url TEXT,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- =============================================
-- PERIPHERALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.peripherals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- mouse, keyboard, mousepad, headset, monitor, etc
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    image_url TEXT,
    purchase_url TEXT,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_category CHECK (category IN ('mouse', 'keyboard', 'mousepad', 'headset', 'monitor', 'microphone', 'controller', 'chair', 'other'))
);

-- =============================================
-- GAME RANKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.game_ranks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game TEXT NOT NULL, -- valorant, cs2, r6, apex, etc
    rank TEXT NOT NULL,
    rank_tier TEXT, -- Iron 1, Gold 3, etc
    peak_rank TEXT,
    hours_played INTEGER,
    icon_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_game CHECK (game IN ('valorant', 'cs2', 'r6', 'apex', 'league', 'overwatch', 'fortnite', 'cod', 'other')),
    UNIQUE(user_id, game)
);

-- =============================================
-- CLIPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    game TEXT,
    duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100)
);

-- =============================================
-- CLIP LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clip_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(clip_id, user_id)
);

-- =============================================
-- CLIP VIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clip_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- nullable for anonymous views
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROFILE VIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- nullable for anonymous views
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_peripherals_user_id ON public.peripherals(user_id);
CREATE INDEX IF NOT EXISTS idx_peripherals_category ON public.peripherals(category);
CREATE INDEX IF NOT EXISTS idx_game_ranks_user_id ON public.game_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON public.clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON public.clips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clips_game ON public.clips(game);
CREATE INDEX IF NOT EXISTS idx_clip_likes_clip_id ON public.clip_likes(clip_id);
CREATE INDEX IF NOT EXISTS idx_clip_likes_user_id ON public.clip_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_views_clip_id ON public.clip_views(clip_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);

-- =============================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peripherals_updated_at BEFORE UPDATE ON public.peripherals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_ranks_updated_at BEFORE UPDATE ON public.game_ranks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON public.clips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TO CREATE PROFILE ON USER SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FUNCTION TO UPDATE CLIP LIKES COUNT
-- =============================================
CREATE OR REPLACE FUNCTION update_clip_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clips
        SET likes = likes + 1
        WHERE id = NEW.clip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clips
        SET likes = likes - 1
        WHERE id = OLD.clip_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clip_likes_count_trigger
    AFTER INSERT OR DELETE ON public.clip_likes
    FOR EACH ROW EXECUTE FUNCTION update_clip_likes_count();

-- =============================================
-- FUNCTION TO UPDATE CLIP VIEWS COUNT
-- =============================================
CREATE OR REPLACE FUNCTION update_clip_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clips
    SET views = views + 1
    WHERE id = NEW.clip_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clip_views_count_trigger
    AFTER INSERT ON public.clip_views
    FOR EACH ROW EXECUTE FUNCTION update_clip_views_count();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peripherals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow manual too)
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =============================================
-- PERIPHERALS POLICIES
-- =============================================
-- Anyone can view peripherals
CREATE POLICY "Peripherals are viewable by everyone"
    ON public.peripherals FOR SELECT
    USING (true);

-- Users can insert their own peripherals
CREATE POLICY "Users can insert own peripherals"
    ON public.peripherals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own peripherals
CREATE POLICY "Users can update own peripherals"
    ON public.peripherals FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own peripherals
CREATE POLICY "Users can delete own peripherals"
    ON public.peripherals FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- GAME RANKS POLICIES
-- =============================================
-- Anyone can view game ranks
CREATE POLICY "Game ranks are viewable by everyone"
    ON public.game_ranks FOR SELECT
    USING (true);

-- Users can insert their own game ranks
CREATE POLICY "Users can insert own game ranks"
    ON public.game_ranks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own game ranks
CREATE POLICY "Users can update own game ranks"
    ON public.game_ranks FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own game ranks
CREATE POLICY "Users can delete own game ranks"
    ON public.game_ranks FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- CLIPS POLICIES
-- =============================================
-- Anyone can view clips
CREATE POLICY "Clips are viewable by everyone"
    ON public.clips FOR SELECT
    USING (true);

-- Users can insert their own clips
CREATE POLICY "Users can insert own clips"
    ON public.clips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own clips
CREATE POLICY "Users can update own clips"
    ON public.clips FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own clips
CREATE POLICY "Users can delete own clips"
    ON public.clips FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- CLIP LIKES POLICIES
-- =============================================
-- Anyone can view likes
CREATE POLICY "Clip likes are viewable by everyone"
    ON public.clip_likes FOR SELECT
    USING (true);

-- Authenticated users can like clips
CREATE POLICY "Authenticated users can like clips"
    ON public.clip_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove own likes"
    ON public.clip_likes FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- CLIP VIEWS POLICIES
-- =============================================
-- Only allow inserting views (for tracking)
CREATE POLICY "Anyone can insert clip views"
    ON public.clip_views FOR INSERT
    WITH CHECK (true);

-- Only owners can view their clip views
CREATE POLICY "Clip owners can view clip views"
    ON public.clip_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clips
            WHERE clips.id = clip_views.clip_id
            AND clips.user_id = auth.uid()
        )
    );

-- =============================================
-- PROFILE VIEWS POLICIES
-- =============================================
-- Anyone can insert profile views
CREATE POLICY "Anyone can insert profile views"
    ON public.profile_views FOR INSERT
    WITH CHECK (true);

-- Profile owners can view their profile views
CREATE POLICY "Profile owners can view profile views"
    ON public.profile_views FOR SELECT
    USING (auth.uid() = profile_id);
