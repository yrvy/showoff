-- Followers/Following System
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- RLS Policies for follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly readable"
    ON public.follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Direct Messages System
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- RLS Policies for messaging
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
    ON public.conversations FOR SELECT
    USING (
        id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view participants in their conversations"
    ON public.conversation_participants FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations they're invited to"
    ON public.conversation_participants FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(profile_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.follows
    WHERE following_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(profile_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.follows
    WHERE follower_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Function to get total likes for a user's clips
CREATE OR REPLACE FUNCTION get_total_likes(profile_id UUID)
RETURNS INTEGER AS $$
    SELECT COALESCE(SUM(likes), 0)::INTEGER
    FROM public.clips
    WHERE user_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Function to get total views for a user's clips
CREATE OR REPLACE FUNCTION get_total_views(profile_id UUID)
RETURNS INTEGER AS $$
    SELECT COALESCE(SUM(views), 0)::INTEGER
    FROM public.clips
    WHERE user_id = profile_id;
$$ LANGUAGE SQL STABLE;
