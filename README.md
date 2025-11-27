# ShowOff - Gaming Profile Platform

A production-ready gaming profile platform where users can showcase their setup, share clips, and display their competitive ranks. Similar to site.gg.

## 🎮 Features

- **User Authentication** - Email authentication with Supabase Auth
- **Public Profiles** - Each user gets a public profile at `/{username}`
- **Peripherals Showcase** - Display gaming gear with images and purchase links
- **Clip Upload System** - Upload videos with automatic thumbnail generation
- **Game Ranks** - Display competitive ranks across multiple games
- **Social Links** - Connect Twitter, Twitch, YouTube, Discord, and Instagram
- **Verified Badges** - Verified user system
- **Dark Theme** - Modern, esports-aesthetic dark UI
- **Responsive Design** - Fully responsive on all devices
- **SEO Optimized** - Meta tags for social sharing

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd showoff
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

#### 3.2 Run Database Migrations

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Run the migrations in order:

**First, run `supabase/migrations/001_initial_schema.sql`:**
- Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
- Paste it into the SQL Editor
- Click "Run"
- This creates all tables, indexes, RLS policies, and triggers

**Then, run `supabase/migrations/002_storage_setup.sql`:**
- Copy the entire contents of `supabase/migrations/002_storage_setup.sql`
- Paste it into the SQL Editor
- Click "Run"
- This creates storage buckets and policies

#### 3.3 Verify Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. You should see these buckets:
   - `avatars` (5MB limit, public)
   - `banners` (10MB limit, public)
   - `peripherals` (5MB limit, public)
   - `clips` (500MB limit, public)
   - `thumbnails` (2MB limit, public)

If they don't appear, make sure you ran the storage migration successfully.

### 4. Configure Environment Variables

1. In your Supabase project, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)

### 6. (Optional) Seed Example Data

After creating your first user account:

1. Get your user ID:
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - Copy your user ID

2. Update the seed file:
   - Open `supabase/seed.sql`
   - The script will automatically use the first user in your database

3. Run the seed script in the SQL Editor:
   - Copy the contents of `supabase/seed.sql`
   - Paste into SQL Editor
   - Click "Run"

## 📁 Project Structure

```
showoff/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ClipUploadModal.tsx
│   │   ├── PeripheralModal.tsx
│   │   └── GameRankModal.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditProfile.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/              # Utilities and configurations
│   │   ├── supabase.ts   # Supabase client & types
│   │   ├── auth.ts       # Authentication functions
│   │   ├── storage.ts    # File upload functions
│   │   └── utils.ts      # Utility functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── supabase/
│   ├── migrations/       # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_storage_setup.sql
│   └── seed.sql          # Seed data
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

## 🗄️ Database Schema

### Tables

- **profiles** - User profile information
- **peripherals** - Gaming gear/peripherals
- **game_ranks** - Competitive game ranks
- **clips** - Uploaded video clips
- **clip_likes** - Clip likes from users
- **clip_views** - Clip view tracking
- **profile_views** - Profile view tracking

### Storage Buckets

- **avatars** - Profile pictures (5MB max)
- **banners** - Profile banners (10MB max)
- **peripherals** - Peripheral images (5MB max)
- **clips** - Video files (500MB max)
- **thumbnails** - Video thumbnails (2MB max)

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only modify their own data
- All content is publicly readable
- Authenticated users can like clips and view profiles

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: { ... },  // Main accent color
  accent: { ... },   // Secondary accent color
  dark: { ... },     // Dark theme colors
}
```

### Adding New Games

To add new games to the ranks system:

1. Update the SQL constraint in `supabase/migrations/001_initial_schema.sql`
2. Update the TypeScript type in `src/lib/supabase.ts`
3. Update the select options in components that use games

## 🚢 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploying to Netlify

1. Push your code to GitHub
2. Import your repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

### Deploying to Lovable Cloud

Since this is designed for Lovable:

1. Import the project into Lovable
2. Connect your Supabase project via environment variables
3. Deploy with one click

## 📝 Usage Guide

### For Users

1. **Sign Up**: Create an account with email and password
2. **Edit Profile**: Add your bio, avatar, banner, and social links
3. **Add Peripherals**: Showcase your gaming setup
4. **Add Ranks**: Display your competitive ranks
5. **Upload Clips**: Share your best gaming moments
6. **Share Profile**: Share your profile URL (`/{username}`)

### For Admins

To verify a user:

```sql
UPDATE profiles
SET is_verified = true
WHERE username = 'username';
```

## 🔧 Troubleshooting

### "Missing Supabase environment variables"

Make sure your `.env` file exists and contains valid credentials.

### Uploads failing

1. Check that storage buckets exist in Supabase
2. Verify file size limits
3. Check browser console for errors
4. Ensure RLS policies are set correctly

### Authentication not working

1. Verify Supabase URL and anon key are correct
2. Check that email confirmation is disabled (or handle confirmation emails)
3. Go to Supabase Dashboard → **Authentication** → **Settings** → **Email Auth** → Disable "Confirm email"

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Inspired by site.gg and similar gaming profile platforms
- Built with Supabase, React, and Tailwind CSS
- Icons by Lucide

## 🐛 Known Issues

- Video thumbnails may not generate for all video formats
- Large video uploads may take time depending on connection speed
- Mobile video playback may vary by browser

## 🔮 Future Enhancements

- OAuth providers (Google, Discord, Twitch)
- Advanced clip editing
- Community features (following, comments)
- Leaderboards
- Team/clan support
- Tournament integration
- Stream integration

## 📞 Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with details
- Include error messages and screenshots

---

Built with ❤️ for the gaming community
