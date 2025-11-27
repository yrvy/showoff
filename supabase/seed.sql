-- ShowOff Gaming Profile Platform - Seed Data
-- This file contains example data for development and testing

-- NOTE: This seed data assumes you have created a test user via Supabase Auth
-- The user_id below should be replaced with an actual user ID from your auth.users table

-- Example user ID (replace with actual user ID after creating a test user)
-- You can get this by signing up in your app or running:
-- SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
    example_user_id UUID;
BEGIN
    -- Try to get the first user, or create a dummy one for reference
    SELECT id INTO example_user_id FROM auth.users LIMIT 1;

    IF example_user_id IS NULL THEN
        -- If no users exist, use a placeholder UUID
        -- You'll need to replace this with a real user ID
        example_user_id := '00000000-0000-0000-0000-000000000000';
        RAISE NOTICE 'No users found. Using placeholder UUID. Please create a user first!';
    END IF;

    -- =============================================
    -- SAMPLE PROFILE
    -- =============================================
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        bio,
        twitter_url,
        twitch_url,
        youtube_url,
        discord_tag,
        is_verified
    ) VALUES (
        example_user_id,
        'shroud',
        'Shroud',
        'Professional gamer and streamer. Former CS:GO pro. Just here to show off my setup and clips.',
        'https://twitter.com/shroud',
        'https://twitch.tv/shroud',
        'https://youtube.com/shroud',
        'shroud#0001',
        true
    ) ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        twitter_url = EXCLUDED.twitter_url,
        twitch_url = EXCLUDED.twitch_url,
        youtube_url = EXCLUDED.youtube_url,
        discord_tag = EXCLUDED.discord_tag,
        is_verified = EXCLUDED.is_verified;

    -- =============================================
    -- SAMPLE PERIPHERALS
    -- =============================================
    INSERT INTO public.peripherals (user_id, category, brand, model, purchase_url, notes, display_order) VALUES
        (example_user_id, 'mouse', 'Logitech', 'G Pro X Superlight', 'https://www.logitechg.com/en-us/products/gaming-mice/pro-x-superlight-wireless-mouse.html', 'Lightweight wireless mouse, perfect for FPS games', 1),
        (example_user_id, 'keyboard', 'Logitech', 'G Pro X Mechanical', 'https://www.logitechg.com/en-us/products/gaming-keyboards/pro-x-gaming-keyboard.html', 'Clicky switches, compact layout', 2),
        (example_user_id, 'mousepad', 'Logitech', 'G640', 'https://www.logitechg.com/en-us/products/gaming-mouse-pads/g640-large-cloth-gaming-mouse-pad.html', 'Large cloth mousepad', 3),
        (example_user_id, 'headset', 'HyperX', 'Cloud II', 'https://www.hyperx.com/products/hyperx-cloud-ii-gaming-headset', 'Comfortable for long gaming sessions', 4),
        (example_user_id, 'monitor', 'ASUS', 'ROG Swift PG259QN', 'https://rog.asus.com/monitors/27-to-31-5-inches/rog-swift-360hz-pg259qn-model/', '360Hz refresh rate, 1080p', 5)
    ON CONFLICT DO NOTHING;

    -- =============================================
    -- SAMPLE GAME RANKS
    -- =============================================
    INSERT INTO public.game_ranks (user_id, game, rank, rank_tier, peak_rank, hours_played, is_primary) VALUES
        (example_user_id, 'valorant', 'Radiant', 'Radiant', 'Radiant', 2500, true),
        (example_user_id, 'cs2', 'Global Elite', 'Global Elite', 'Global Elite', 5000, false),
        (example_user_id, 'apex', 'Predator', 'Predator', 'Predator', 1500, false)
    ON CONFLICT (user_id, game) DO UPDATE SET
        rank = EXCLUDED.rank,
        rank_tier = EXCLUDED.rank_tier,
        peak_rank = EXCLUDED.peak_rank,
        hours_played = EXCLUDED.hours_played,
        is_primary = EXCLUDED.is_primary;

    RAISE NOTICE 'Seed data inserted successfully for user: %', example_user_id;
END $$;

-- =============================================
-- SAMPLE CLIPS
-- Note: These will have placeholder URLs. In production, these would be actual uploaded videos
-- =============================================

-- You can add sample clips here after uploading real videos to your storage bucket
-- Example:
-- INSERT INTO public.clips (user_id, title, description, video_url, thumbnail_url, game, duration) VALUES
-- (example_user_id, 'Insane 1v5 Clutch', 'Got a crazy ace in ranked', 'https://your-supabase-url.supabase.co/storage/v1/object/public/clips/...', 'https://your-supabase-url.supabase.co/storage/v1/object/public/thumbnails/...', 'valorant', 45);
