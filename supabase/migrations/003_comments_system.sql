-- ShowOff - Comments System Migration
-- Adds comments functionality for clips

-- =============================================
-- COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT comment_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_comments_clip_id ON public.comments(clip_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);
