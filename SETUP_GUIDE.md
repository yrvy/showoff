# ShowOff - Complete Setup Guide

This guide will walk you through setting up the ShowOff gaming profile platform from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up for free](https://supabase.com)

## Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization or create a new one
4. Fill in project details:
   - **Name**: ShowOff (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

### Step 2: Configure Authentication

1. In your Supabase dashboard, navigate to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ✅ Enable email provider
   - ❌ Disable "Confirm email" (for easier development)
   - ✅ Enable "Allow disposable email addresses" (optional, for testing)
3. Click "Save"

### Step 3: Run Database Migrations

#### Migration 1: Initial Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Open `supabase/migrations/001_initial_schema.sql` from the project
4. Copy the **entire contents** of the file
5. Paste into the SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

**What this creates:**
- `profiles` table for user data
- `peripherals` table for gaming gear
- `game_ranks` table for competitive ranks
- `clips` table for video uploads
- `clip_likes` and `clip_views` tables for engagement
- `profile_views` table for analytics
- All necessary indexes and triggers
- Row Level Security (RLS) policies

#### Migration 2: Storage Setup

1. Still in the SQL Editor, create a new query
2. Open `supabase/migrations/002_storage_setup.sql`
3. Copy the **entire contents**
4. Paste into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

**What this creates:**
- `avatars` bucket (5MB limit)
- `banners` bucket (10MB limit)
- `peripherals` bucket (5MB limit)
- `clips` bucket (500MB limit)
- `thumbnails` bucket (2MB limit)
- All necessary storage policies

#### Verify Storage Buckets

1. Navigate to **Storage** in your Supabase dashboard
2. You should see 5 buckets listed
3. Click on each bucket to verify it exists
4. Check that each bucket shows as "Public"

### Step 4: Get Your API Credentials

1. Go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Keep this tab open, you'll need these values next

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd showoff

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
   ```

   **Important**: Don't add quotes around the values!

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

### Test 1: Sign Up

1. Click "Sign Up" in the navigation
2. Fill in the form:
   - **Username**: `testuser` (lowercase, no spaces)
   - **Email**: `test@example.com`
   - **Password**: `password123`
3. Click "Sign Up"
4. You should be redirected to the login page
5. Check your Supabase dashboard **Authentication** → **Users** to see the new user

### Test 2: Log In

1. Log in with the credentials you just created
2. You should see the Dashboard

### Test 3: Edit Profile

1. Click "Edit Profile" in the dashboard
2. Update your profile:
   - Change display name
   - Add a bio
   - Add social links (optional)
3. Try uploading an avatar image (max 5MB)
4. Try uploading a banner image (max 10MB)
5. Click "Save Changes"
6. You should be redirected to your public profile

### Test 4: Add a Peripheral

1. Go back to Dashboard
2. In the "Peripherals" section, click "Add Peripheral"
3. Fill in:
   - **Category**: Mouse
   - **Brand**: Logitech
   - **Model**: G Pro X Superlight
   - **Purchase URL**: https://www.logitech.com
   - Upload an image (optional)
4. Click "Add Peripheral"
5. You should see it appear in your dashboard

### Test 5: Add a Game Rank

1. In the "Game Ranks" section, click "Add Rank"
2. Fill in:
   - **Game**: Valorant
   - **Rank**: Radiant
   - **Rank Tier**: Radiant (or specific tier)
   - **Peak Rank**: Radiant
   - **Hours Played**: 1000
   - Check "Set as primary game"
3. Click "Add Rank"

### Test 6: Upload a Clip

1. In the "Clips" section, click "Upload Clip"
2. Fill in:
   - **Video File**: Choose a video file (max 500MB, MP4 recommended)
   - **Title**: "My Epic Play"
   - **Description**: "Check out this amazing clutch"
   - **Game**: Valorant
3. Click "Upload Clip"
4. Wait for upload to complete (progress bar shows status)
5. You should see the clip in your dashboard

**Note**: Large videos may take several minutes to upload depending on your connection.

### Test 7: View Public Profile

1. Click "View Profile" in the dashboard
2. You should see your public profile at `localhost:3000/{username}`
3. Verify all your content appears:
   - Avatar and banner
   - Bio and social links
   - Game ranks
   - Peripherals
   - Clips
4. Try clicking on a clip to watch it

### Test 8: Test Anonymous Access

1. Open an incognito/private browser window
2. Go to `localhost:3000/{username}` (your username)
3. You should be able to view the profile without logging in
4. Try clicking on clips
5. Try liking a clip (should prompt to log in)

## Troubleshooting

### "Missing Supabase environment variables"

**Problem**: App shows error on startup

**Solution**:
1. Check that `.env` file exists in the root directory
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure there are no quotes around the values
4. Restart the dev server after changing `.env`

### "Failed to load data" or "Failed to fetch profile"

**Problem**: Database queries failing

**Solution**:
1. Verify migrations ran successfully in Supabase
2. Check **Table Editor** in Supabase to ensure tables exist
3. Check browser console for specific error messages
4. Verify RLS policies are enabled

### Storage/Upload Issues

**Problem**: "Failed to upload" errors

**Solution**:
1. Go to **Storage** in Supabase dashboard
2. Verify all 5 buckets exist
3. Click on each bucket and check policies are set
4. Verify file size is within limits:
   - Avatars: 5MB
   - Banners: 10MB
   - Peripherals: 5MB
   - Clips: 500MB
   - Thumbnails: 2MB
5. Check browser console for specific errors

### Authentication Issues

**Problem**: Can't sign up or log in

**Solution**:
1. Check **Authentication** → **Settings** in Supabase
2. Ensure email auth is enabled
3. For development, disable email confirmation
4. Check browser console for errors
5. Verify `auth.users` table exists in Database

### Video Upload Fails

**Problem**: Clip uploads fail or hang

**Solutions**:
1. **File too large**: Check file is under 500MB
2. **Wrong format**: Use MP4, WebM, or MOV
3. **Slow connection**: Large files may timeout
4. **Browser compatibility**: Try different browser
5. **Check storage bucket**: Verify `clips` bucket exists and has correct policies

### Thumbnail Generation Fails

**Problem**: Clips upload but show no thumbnail

**Solution**:
- This is normal for some video formats
- The app will show a default play icon instead
- Thumbnail generation works best with MP4 files
- This doesn't affect video playback

### "Username already taken"

**Problem**: Can't create user with desired username

**Solution**:
1. Usernames must be unique
2. Try a different username
3. Check existing users in Supabase **Authentication** → **Users**
4. View `profiles` table to see taken usernames

### Port 3000 Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- --port 3001
```

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser

**Solution**:
1. Hard refresh browser (Ctrl/Cmd + Shift + R)
2. Clear browser cache
3. Restart dev server
4. Check for JavaScript errors in console

## Next Steps

Once everything is working:

1. **Customize Branding**:
   - Update colors in `tailwind.config.ts`
   - Change app name in `index.html` and throughout
   - Add your own logo

2. **Optional: Seed Data**:
   - Run `supabase/seed.sql` for example data
   - Modify to match your first user ID

3. **Deploy**:
   - See README.md for deployment instructions
   - Recommended: Vercel, Netlify, or Lovable Cloud

4. **Production Checklist**:
   - [ ] Enable email confirmation in Supabase
   - [ ] Set up custom domain
   - [ ] Configure OAuth providers (optional)
   - [ ] Set up monitoring/analytics
   - [ ] Review RLS policies
   - [ ] Set up backups
   - [ ] Add rate limiting (optional)

## Getting Help

If you encounter issues not covered here:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Review the main README.md
4. Check GitHub issues
5. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Screenshots
   - Browser and OS info

---

**Congratulations!** 🎉 You now have a fully functional gaming profile platform!
